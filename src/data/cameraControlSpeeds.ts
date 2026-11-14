/**
 * 將設定頁的滑鼠靈敏度／縮放速度換成 3D 鏡頭實際倍率。
 * 100% 對齊原本寫死的軌道預設（1）與操控視角係數。
 */

const WALK_YAW_RATE = 0.0075;
const WALK_PITCH_RATE = 0.005;
const WALK_ZOOM_RATE = 0.004;

export function applyOrbitControlSpeeds(
  orbit: { rotateSpeed: number; zoomSpeed: number; panSpeed: number },
  controls: { mouseSensitivity: number; zoomSpeed: number },
): void {
  orbit.rotateSpeed = controls.mouseSensitivity;
  orbit.panSpeed = controls.mouseSensitivity;
  orbit.zoomSpeed = controls.zoomSpeed;
}

export function resolveWalkLookDelta(
  dx: number,
  dy: number,
  mouseSensitivity: number,
): { yaw: number; pitch: number } {
  return {
    yaw: -dx * WALK_YAW_RATE * mouseSensitivity,
    pitch: dy * WALK_PITCH_RATE * mouseSensitivity,
  };
}

export function resolveWalkZoomDelta(deltaY: number, zoomSpeed: number): number {
  return deltaY * WALK_ZOOM_RATE * zoomSpeed;
}
