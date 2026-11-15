import { describe, expect, it } from 'vitest';
import {
  applyOrbitControlSpeeds,
  resolveWalkLookDelta,
  resolveWalkZoomDelta,
} from '@/data/cameraControlSpeeds';

describe('camera control speeds from settings', () => {
  it('scales orbit rotate, pan, and zoom from the settings multipliers', () => {
    const orbit = { rotateSpeed: 9, zoomSpeed: 9, panSpeed: 9 };
    applyOrbitControlSpeeds(orbit, { mouseSensitivity: 0.5, zoomSpeed: 0.25 });
    expect(orbit.rotateSpeed).toBe(0.5);
    expect(orbit.panSpeed).toBe(0.5);
    expect(orbit.zoomSpeed).toBe(0.25);
  });

  it('keeps 100% at the existing walk look and zoom rates', () => {
    expect(resolveWalkLookDelta(10, -4, 1)).toEqual({
      yaw: -10 * 0.0075,
      pitch: -4 * 0.005,
    });
    expect(resolveWalkZoomDelta(100, 1)).toBe(100 * 0.004);
  });

  it('scales walk look and zoom when the sliders are not 100%', () => {
    expect(resolveWalkLookDelta(10, 4, 0.5)).toEqual({
      yaw: -10 * 0.0075 * 0.5,
      pitch: 4 * 0.005 * 0.5,
    });
    expect(resolveWalkZoomDelta(100, 0.5)).toBe(100 * 0.004 * 0.5);
  });
});
