import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class X11Service {
  private readonly logger = new Logger(X11Service.name);
  private readonly display = ':1'; // Default display for Webtop

  /**
   * Executes a shell command and returns the result.
   */
  private async execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Set DISPLAY environment variable for X11
      const env = { ...process.env, DISPLAY: this.display };
      
      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Command failed: ${command}`);
          this.logger.error(`Error: ${error.message}`);
          if (stderr) {
            this.logger.error(`stderr: ${stderr}`);
          }
          reject(error);
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  /**
   * Sends key events to the X11 display.
   */
  async sendKey(key: string): Promise<string> {
    this.logger.log(`Sending key: ${key}`);
    return this.execCommand(`xdotool key ${key}`);
  }

  /**
   * Types text by simulating keystrokes.
   */
  async typeText(text: string, delayMs: number = 100): Promise<string> {
    this.logger.log(`Typing text: ${text}`);
    const escapedText = text.replace(/'/g, "'\\''")
    return this.execCommand(
      `xdotool type --delay ${delayMs} '${escapedText}'`
    );
  }

  /**
   * Moves the mouse pointer to specified coordinates.
   */
  async mouseMove(x: number, y: number): Promise<string> {
    this.logger.log(`Moving mouse to: (${x}, ${y})`);
    return this.execCommand(`xdotool mousemove ${x} ${y}`);
  }

  /**
   * Simulates a mouse button press or release.
   */
  async mouseButtonEvent(
    button: 'left' | 'right' | 'middle',
    pressed: boolean,
  ): Promise<string> {
    const buttonMap = {
      left: 1,
      middle: 2,
      right: 3,
    };
    
    const action = pressed ? 'mousedown' : 'mouseup';
    this.logger.log(`Mouse ${button} button ${action}`);
    
    return this.execCommand(
      `xdotool ${action} ${buttonMap[button]}`
    );
  }

  /**
   * Performs a mouse click (press and release).
   */
  async mouseClick(
    button: 'left' | 'right' | 'middle',
    delayMs: number = 100,
  ): Promise<string> {
    const buttonMap = {
      left: 1,
      middle: 2,
      right: 3,
    };
    
    this.logger.log(`Clicking ${button} mouse button`);
    return this.execCommand(
      `xdotool click --delay ${delayMs} ${buttonMap[button]}`
    );
  }

  /**
   * Performs a drag operation by clicking at start coordinates, holding, moving to end coordinates, and releasing.
   */
  async mouseDrag(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    holdMs: number = 100,
  ): Promise<string> {
    this.logger.log(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);
    // This command sequence does a complete drag operation
    return this.execCommand(
      `xdotool mousemove ${startX} ${startY} mousedown 1 sleep ${holdMs/1000} mousemove ${endX} ${endY} mouseup 1`
    );
  }

  /**
   * Performs a double click.
   */
  async mouseDoubleClick(delayMs: number = 100): Promise<string> {
    this.logger.log(`Performing double click`);
    return this.execCommand(`xdotool click --repeat 2 --delay ${delayMs} 1`);
  }

  /**
   * Scrolls the mouse wheel.
   */
  async mouseWheel(axis: 'v' | 'h', value: number): Promise<string> {
    if (axis === 'v') {
      // Vertical scrolling: 4 = up, 5 = down
      const button = value > 0 ? 4 : 5;
      const count = Math.min(Math.max(Math.round(Math.abs(value) / 50), 1), 10);
      this.logger.log(`Scrolling vertically with button ${button}, count ${count}`);
      return this.execCommand(`xdotool click --repeat ${count} ${button}`);
    } else {
      try {
        // Try buttons 6 & 7 for horizontal scrolling (if supported)
        const button = value > 0 ? 6 : 7;
        const count = Math.min(Math.max(Math.round(Math.abs(value) / 50), 1), 10);
        this.logger.log(`Scrolling horizontally with button ${button}, count ${count}`);
        return this.execCommand(`xdotool click --repeat ${count} ${button}`);
      } catch (error) {
        // Fallback: simulate horizontal scrolling with key presses
        const key = value > 0 ? 'Left' : 'Right';
        const count = Math.min(Math.max(Math.round(Math.abs(value) / 50), 1), 10);
        this.logger.log(`Scrolling horizontally with key ${key}, count ${count}`);
        return this.execCommand(`xdotool key --repeat ${count} ${key}`);
      }
    }
  }

  /**
   * Returns the current cursor position.
   */
  async getCursorPosition(): Promise<{ x: number; y: number }> {
    this.logger.log('Getting cursor position');
    const output = await this.execCommand('xdotool getmouselocation');
    
    // Parse the output which looks like: "x:100 y:200 screen:0 window:123456"
    const matches = output.match(/x:(\d+) y:(\d+)/);
    if (matches && matches.length >= 3) {
      const x = parseInt(matches[1], 10);
      const y = parseInt(matches[2], 10);
      return { x, y };
    }
    
    throw new Error(`Could not parse cursor position from: ${output}`);
  }

  /**
   * Takes a screenshot of the current screen.
   */
  async screenshot(): Promise<Buffer> {
    const tmpFile = `/tmp/x11-screen-${Date.now()}.png`;
    this.logger.log(`Taking screenshot to ${tmpFile}`);
    
    try {
      // Use scrot for screenshots
      await this.execCommand(`scrot -z '${tmpFile}'`);
      
      // Wait a moment to ensure the file is written
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const imageBuffer = await fs.readFile(tmpFile);
      this.logger.log(`Screenshot captured: ${imageBuffer.length} bytes`);
      
      return imageBuffer;
    } catch (error) {
      this.logger.error(`Screenshot error: ${error.message}`);
      throw error;
    } finally {
      // Cleanup
      try {
        await fs.unlink(tmpFile);
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }
  }
}
