// client/src/state/types.ts

export type UIEvent =
  | { type: 'button_press'; id: string }
  | { type: 'button_release'; id: string }
  | { type: 'knob_turn'; id: string; direction: 'left' | 'right' }
  | { type: 'slider_change'; id: string; value: number } // 🆕 Added
  | { type: 'init' };

  export type Command =
  | { type: 'set_button_color'; id: string; color: string }
  | { type: 'set_button_light'; id: string; on: boolean }
  | { type: 'start_blinking'; id: string }
  | { type: 'stop_blinking'; id: string }
  | { type: 'set_indicator'; id: string; color: string; label?: string }
  | { type: 'set_condition_color'; id: string; label: string; color: 'red' | 'green' | 'amber' | 'white' | 'off' }
  | { type: 'state_change'; id: string; state: AppState };

export type AppState = 'off' | 'startup' | 'on' | 'shutdown';
export type ConditionColor = 'red' | 'green' | 'amber' | 'white' | 'off';

export type CommandCallback = (command: Command) => void;
