import React, { useState, useEffect } from 'react';
import { registry } from '../state/registry';
import stateMachine from '../state/StateMachine';
import type { Command, AppState } from '../state/types';

import '../css/components/ScramButton.css';

import bezel from '../images/e-stop_bezel.png';
import buttonOut from '../images/e-stop_out.png';
import buttonIn from '../images/e-stop_in.png';

interface ScramButtonProps {
  id: string;
  x: number;
  y: number;
}

export default function ScramButton({ id, x, y }: ScramButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'init') {
        // Reset component state
        setPressed(false);
        setIsTestMode(false);
        // Acknowledge this component when initialization is requested
        registry.acknowledge(id);
      } else if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
        setPressed(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        
        // Press the button during test
        setPressed(true);
        
        // After a short delay, release and complete test
        setTimeout(() => {
          setPressed(false);
          setIsTestMode(false);
          
          // Emit test result when test sequence completes
          stateMachine.emit({
            type: 'test_result',
            id,
            passed: true
          });
        }, 500);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);

  const handleClick = () => {
    if (!isTestMode) {
      const newPressed = !pressed;
      setPressed(newPressed);
      
      if (newPressed) {
        // Emit SCRAM command
        stateMachine.emit({
          type: 'button_press',
          id
        });
      }
    }
  };

  return (
    <div
      className="scram-button-wrapper"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={handleClick}
      tabIndex={-1}
    >
      <img src={bezel} className="scram-button-img" alt="Scram bezel" />
      <img
        src={pressed ? buttonIn : buttonOut}
        className="scram-button-overlay"
        alt={pressed ? 'Pressed in' : 'Raised'}
      />
    </div>
  );
}
