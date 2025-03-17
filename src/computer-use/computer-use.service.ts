import { Injectable, Logger } from '@nestjs/common';
import { X11Service } from '../x11/x11.service';

export type Button = 'left' | 'right' | 'middle';

@Injectable()
export class ComputerUseService {
  private readonly logger = new Logger(ComputerUseService.name);
  // Track the last known cursor position.
  private cursorPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(private readonly x11Service: X11Service) {}

  /**
   * "key": Sends a single key event.
   * @param key A string representing the key (e.g. "enter", "a", etc.).
   */
  async key(key: string): Promise<any> {
    this.logger.log(`Sending key: ${key}`);
    return this.x11Service.sendKey(key);
  }

  /**
   * "type": Simulates typing text by sending each character with a small delay.
   * @param text The text to type.
   * @param delayMs Optional delay in milliseconds between keystrokes (default 100ms).
   */
  async type(text: string, delayMs: number = 100): Promise<any> {
    this.logger.log(`Typing text: ${text}`);
    return await this.x11Service.typeText(text, delayMs);
  }

  /**
   * "mouse_move": Moves the mouse pointer to the specified coordinates.
   * @param x The absolute x-coordinate.
   * @param y The absolute y-coordinate.
   */
  async mouse_move(x: number, y: number): Promise<any> {
    this.logger.log(`Moving mouse to: (${x}, ${y})`);
    this.cursorPosition = { x, y };
    return this.x11Service.mouseMove(x, y);
  }

  /**
   * "left_click": Performs a left mouse click at the current cursor position.
   */
  async left_click(): Promise<any> {
    this.logger.log(
      `Performing left click at (${this.cursorPosition.x}, ${this.cursorPosition.y})`,
    );
    return await this.x11Service.mouseClick('left');
  }

  /**
   * "left_click_drag": Clicks, holds, moves, and then releases the left mouse button.
   * @param startX Starting x-coordinate.
   * @param startY Starting y-coordinate.
   * @param endX Ending x-coordinate.
   * @param endY Ending y-coordinate.
   * @param holdMs Optional delay (in ms) to hold the click before dragging (default 100ms).
   */
  async left_click_drag(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    holdMs: number = 100,
  ): Promise<any> {
    this.logger.log(
      `Performing left click drag from (${startX}, ${startY}) to (${endX}, ${endY})`,
    );
    
    // Use the X11Service's mouseDrag method for a more reliable drag operation
    const result = await this.x11Service.mouseDrag(startX, startY, endX, endY, holdMs);
    
    // Update the tracked cursor position.
    this.cursorPosition = { x: endX, y: endY };
    
    return result;
  }

  /**
   * "right_click": Performs a right mouse click at the current cursor position.
   */
  async right_click(): Promise<any> {
    this.logger.log(
      `Performing right click at (${this.cursorPosition.x}, ${this.cursorPosition.y})`,
    );
    return await this.x11Service.mouseClick('right');
  }

  /**
   * "middle_click": Performs a middle mouse click at the current cursor position.
   */
  async middle_click(): Promise<any> {
    this.logger.log(
      `Performing middle click at (${this.cursorPosition.x}, ${this.cursorPosition.y})`,
    );
    return await this.x11Service.mouseClick('middle');
  }

  /**
   * "double_click": Performs two consecutive left clicks with a short delay.
   * @param delayMs Optional delay between clicks (default 100ms).
   */
  async double_click(delayMs: number = 100): Promise<any> {
    this.logger.log(
      `Performing double click at (${this.cursorPosition.x}, ${this.cursorPosition.y})`,
    );
    return await this.x11Service.mouseDoubleClick(delayMs);
  }

  /**
   * "screenshot": Captures a screenshot and returns it as a Base64 encoded string.
   */
  async screenshot(): Promise<{ image: string }> {
    this.logger.log(`Taking screenshot`);
    const buffer = await this.x11Service.screenshot();
    return { image: `data:image/png;base64,${buffer.toString('base64')}` };
  }

  /**
   * "cursor_position": Returns the last known cursor position.
   */
  async cursor_position(): Promise<{ x: number; y: number }> {
    try {
      // Get actual cursor position from X11
      const actualPosition = await this.x11Service.getCursorPosition();
      // Update our tracked position
      this.cursorPosition = actualPosition;
    } catch (error) {
      this.logger.warn(`Failed to get actual cursor position: ${error.message}`);
      // Use the last known position if we can't get the actual one
    }
    
    this.logger.log(
      `Returning cursor position: (${this.cursorPosition.x}, ${this.cursorPosition.y})`,
    );
    return this.cursorPosition;
  }

  /**
   * "scroll": Performs a mouse wheel scroll action.
   * @param amount The amount to scroll. Positive values scroll up/right, negative values scroll down/left.
   * @param axis Optional axis to scroll on. 'v' for vertical (default), 'h' for horizontal.
   */
  async scroll(amount: number, axis: 'v' | 'h' = 'v'): Promise<any> {
    this.logger.log(
      `Scrolling ${axis === 'v' ? 'vertically' : 'horizontally'} by ${amount}`,
    );
    return this.x11Service.mouseWheel(axis, amount);
  }

  // Helper: a simple delay.
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
