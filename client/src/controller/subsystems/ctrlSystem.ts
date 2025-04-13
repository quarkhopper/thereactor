import MessageBus from '../../MessageBus';
import { Subsystem } from '../types';
import coreSystem, { findClosestControlRods } from './coreSystem';


const STANDARD_CONTROL_ROD_DELTA = 0.01;

let targetCoreTemp = 0.0
let scram = false; // Track if the system is in scram state

function tick() {
  if (scram) {
    return; // If in scram state, skip the tick
  }
  
  const coreProperties = coreSystem.getState(); // Access fuel rod temperatures from coreSystem
  // Adjust the nearest control rods based on the findClosestControlRods function
  coreProperties.fuelRods.forEach((row, gridX) => {
    row.forEach((rod, gridY) => {
      const delta = rod.temperature > targetCoreTemp ? -STANDARD_CONTROL_ROD_DELTA : STANDARD_CONTROL_ROD_DELTA;
      const closestRods = findClosestControlRods(gridX, gridY);
      closestRods.forEach(({ cx, cy }) => {
        const controlRod = coreProperties.controlRods[cx][cy];
        controlRod.position = Math.max(0, Math.min(1, controlRod.position + delta));
      });
    });
  });

  // Update indicators based on current properties
  MessageBus.emit({
    type: 'ctrl_state_update',
    value: 'normal',
  });
}

// Type guard to validate if a message is relevant to this subsystem
function isValidMessage(msg: Record<string, any>): boolean {
  const validTypes = ['state_change', 'target_temp_update'];
  return validTypes.includes(msg.type);
}

MessageBus.subscribe(handleMessage);

function handleMessage (msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'state_change') {
    // Handle state change messages
    if (msg.state === 'startup' || msg.state === 'on') {
      targetCoreTemp = 0.1; // Reset target core temperature on startup
      scram = false; // Reset scram state
      // Perform actions for 'on' state
    } else if (msg.state === 'scram') {
      console.log('[ctrlSystem] Received scram command - setting target core temperature to 0');
      scram = true;
    }
  } else if (msg.type === 'target_temp_update') {
    // Update target power based on message value
    targetCoreTemp = msg.value;
  } 
}

const ctrlSystem: Subsystem = {
  tick,
  getState: () => ({
    targetCoreTemp,
  }),
};

export default ctrlSystem;