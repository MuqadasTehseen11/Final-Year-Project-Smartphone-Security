import React, { createContext, useState, useContext } from 'react';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState(null);

  return (
    <ImageContext.Provider value={{ capturedImage, setCapturedImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  return useContext(ImageContext);
};
