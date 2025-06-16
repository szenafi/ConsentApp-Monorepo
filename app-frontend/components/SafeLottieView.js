import React, { useState } from 'react';
import LottieView from 'lottie-react-native';

export default function SafeLottieView({ source, fallback = null, ...props }) {
  const [failed, setFailed] = useState(false);

  if (!source || failed) {
    return fallback;
  }

  return (
    <LottieView
      source={source}
      onAnimationFailure={() => setFailed(true)}
      {...props}
    />
  );
}
