import React, { createContext, useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useNavigationContainerRef } from '@react-navigation/native';

export const ShakeContext = createContext();

export const ShakeProvider = ({ children, navigationRef }) => {
  const [shakeEnabled, setShakeEnabled] = useState(false);

  const SHAKE_THRESHOLD = 1.5;

  useEffect(() => {
    let subscription;

    if (shakeEnabled) {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x * x + y * y + z * z);
        if (totalForce > SHAKE_THRESHOLD) {
          // navigate to SelectionScreen from anywhere
          if (navigationRef?.current?.getCurrentRoute()?.name !== 'SelectionScreen') {
            navigationRef.current?.navigate('SelectionScreen');
          }
        }
      });

      Accelerometer.setUpdateInterval(200);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [shakeEnabled]);

  return (
    <ShakeContext.Provider value={{ shakeEnabled, setShakeEnabled }}>
      {children}
    </ShakeContext.Provider>
  );
};
