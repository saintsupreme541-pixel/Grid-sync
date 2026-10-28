
import cv2
import mediapipe as mp
import numpy as np
import os
import time

# ==========================================
# VIRTUAL FINGER PAINT - COMPLETE PROGRAM
# ==========================================

CAMERA_WIDTH = 1280
CAMERA_HEIGHT = 720

# Brush colors in BGR format (OpenCV)
COLORS = [
    ("Blue",   (255, 100, 0)),
    ("Green",  (0, 220, 0)),
    ("Red",    (0, 0, 255)),
    ("Yellow", (0, 255, 255)),
    ("Purple", (255, 0, 255)),
    ("White",  (255, 255, 255)),
]

color_index = 0
brush_size = 8
eraser_size = 35
eraser_mode = False

# White drawing canvas
canvas = np.ones(
    (CAMERA_HEIGHT, CAMERA_WIDTH, 3),
    dtype=np.uint8
) * 255

previous_point = None
smooth_point = None

# MediaPipe hand tracking
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    model_complexity=1,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.65
)

# Start webcam
cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

if not cap.isOpened():
    print("ERROR: Could not open webcam.")
    print("Check camera permissions or try another camera index.")
    raise SystemExit(1)


def finger_is_up(hand_landmarks, tip_id, pip_id):
    """Check whether a finger is extended."""
    return (
        hand_landmarks.landmark[tip_id].y
        < hand_landmarks.landmark[pip_id].y
    )


def draw_interface(frame, color, brush):
    """Draw the on-screen controls."""
    h, w = frame.shape[:2]

    # Header
    cv2.rectangle(frame, (0, 0), (w, 105), (35, 35, 35), -1)

    cv2.putText(
        frame, "VIRTUAL FINGER PAINT",
        (20, 35), cv2.FONT_HERSHEY_SIMPLEX,
        0.9, (255, 255, 255), 2
    )

    mode = "ERASER" if eraser_mode else "DRAWING"
    mode_color = (0, 180, 255) if eraser_mode else color

    cv2.putText(
        frame, f"Mode: {mode}",
        (20, 72), cv2.FONT_HERSHEY_SIMPLEX,
        0.65, mode_color, 2
    )

    cv2.putText(
        frame, f"Brush: {brush}px",
        (260, 72), cv2.FONT_HERSHEY_SIMPLEX,
        0.65, (255, 255, 255), 2
    )

    # Color indicators
    x = 500
    for i, (name, bgr) in enumerate(COLORS):
        cx = x + i * 95
        cy = 35
        radius = 13

        cv2.circle(frame, (cx, cy), radius, bgr, -1)

        if i == color_index and not eraser_mode:
            cv2.circle(frame, (cx, cy), radius + 4,
                       (255, 255, 255), 2)

        cv2.putText(
            frame, name, (cx - 25, 67),
            cv2.FONT_HERSHEY_SIMPLEX, 0.38,
            (255, 255, 255), 1
        )

    # Instructions
    instructions = (
        "INDEX UP: Draw | INDEX + MIDDLE UP: Move cursor"
    )
    cv2.putText(
        frame, instructions, (20, h - 52),
        cv2.FONT_HERSHEY_SIMPLEX, 0.58,
        (0, 0, 0), 2
    )
    cv2.putText(
        frame, "Keys: 1-6 Colors | E Eraser | B Brush | "
               "C Clear | S Save | Q Quit",
        (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX,
        0.52, (0, 0, 0), 2
    )

    return frame


print("Virtual Finger Paint started!")
print("Show your hand to the webcam.")
print("Press Q to quit.")

try:
    while True:
        success, frame = cap.read()

        if not success:
            print("Could not read webcam frame.")
            break

        # Mirror the webcam like a selfie camera
        frame = cv2.flip(frame, 1)
        frame = cv2.resize(frame, (CAMERA_WIDTH, CAMERA_HEIGHT))

        # Convert BGR to RGB for MediaPipe
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        drawing = False
        cursor_point = None

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]

            # Optional hand skeleton
            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

            # Landmark IDs:
            # Index tip = 8, index middle joint = 6
            # Middle tip = 12, middle middle joint = 10
            # Ring tip = 16, ring middle joint = 14
            # Pinky tip = 20, pinky middle joint = 18

            index_up = finger_is_up(
                hand_landmarks, 8, 6
            )
            middle_up = finger_is_up(
                hand_landmarks, 12, 10
            )
            ring_up = finger_is_up(
                hand_landmarks, 16, 14
            )
            pinky_up = finger_is_up(
                hand_landmarks, 20, 18
            )

            # Index fingertip coordinates
            tip = hand_landmarks.landmark[8]

            x = int(tip.x * CAMERA_WIDTH)
            y = int(tip.y * CAMERA_HEIGHT)

            x = max(0, min(CAMERA_WIDTH - 1, x))
            y = max(0, min(CAMERA_HEIGHT - 1, y))

            cursor_point = (x, y)

            # Smooth fingertip movement
            if smooth_point is None:
                smooth_point = np.array(
                    [x, y], dtype=np.float32
                )

            target = np.array([x, y], dtype=np.float32)
            smooth_point = (
                0.65 * smooth_point + 0.35 * target
            )

            x, y = smooth_point.astype(int)
            cursor_point = (x, y)

            # Draw only when index is up and other
            # three fingers are down.
            drawing = (
                index_up
                and not middle_up
                and not ring_up
                and not pinky_up
            )

            # Draw fingertip cursor
            cursor_color = (
                (0, 0, 0) if eraser_mode
                else COLORS[color_index][1]
            )

            cv2.circle(
                frame, cursor_point,
                12 if not eraser_mode else eraser_size,
                cursor_color, 2
            )

            # Draw on the white canvas
            if drawing:
                current_color = (
                    (255, 255, 255)
                    if eraser_mode
                    else COLORS[color_index][1]
                )

                current_size = (
                    eraser_size if eraser_mode
                    else brush_size
                )

                if previous_point is not None:
                    cv2.line(
                        canvas,
                        previous_point,
                        cursor_point,
                        current_color,
                        current_size,
                        cv2.LINE_AA
                    )

                previous_point = cursor_point
            else:
                # Stop drawing when the index finger
                # is lowered or another finger is raised.
                previous_point = None

        else:
            previous_point = None
            smooth_point = None

        # Show the drawing canvas and webcam side by side
        canvas_display = canvas.copy()
        webcam_display = draw_interface(
            frame, COLORS[color_index][1], brush_size
        )

        # Resize to fit a standard display
        combined = np.hstack((
            cv2.resize(webcam_display, (640, 360)),
            cv2.resize(canvas_display, (640, 360))
        ))

        # Label each panel
        cv2.putText(
            combined, "WEBCAM",
            (12, 25), cv2.FONT_HERSHEY_SIMPLEX,
            0.6, (0, 255, 255), 2
        )
        cv2.putText(
            combined, "YOUR DRAWING",
            (652, 25), cv2.FONT_HERSHEY_SIMPLEX,
            0.6, (0, 0, 0), 2
        )

        cv2.imshow("Virtual Finger Paint", combined)

        # Keyboard controls
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

        elif key in [
            ord('1'), ord('2'), ord('3'),
            ord('4'), ord('5'), ord('6')
        ]:
            color_index = int(chr(key)) - 1
            eraser_mode = False

        elif key == ord('e'):
            eraser_mode = not eraser_mode

        elif key == ord('b'):
            brush_size = min(brush_size + 3, 40)

        elif key == ord('v'):
            brush_size = max(brush_size - 3, 2)

        elif key == ord('c'):
            canvas[:] = 255
            previous_point = None

        elif key == ord('s'):
            filename = (
                "finger_paint_"
                + time.strftime("%Y%m%d_%H%M%S")
                + ".png"
            )

            if cv2.imwrite(filename, canvas):
                print(f"Drawing saved: {os.path.abspath(filename)}")
            else:
                print("Could not save the drawing.")

finally:
    cap.release()
    hands.close()
    cv2.destroyAllWindows()
    print("Virtual Finger Paint closed.")
