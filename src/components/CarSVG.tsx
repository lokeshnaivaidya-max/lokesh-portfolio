import React from 'react';
import carFront from '../assets/images/car_front_three_quarter_1784496539473.jpg';
import carSide from '../assets/images/car_side_profile_1784496552016.jpg';
import carRear34 from '../assets/images/car_rear_three_quarter_1784496562339.jpg';
import carRearChase from '../assets/images/car_rear_chase_1784496574706.jpg';

interface CarSVGProps {
  className?: string;
  headlightGlow?: boolean;
  wheelRotation?: number; // in degrees
  exhaustSmoke?: boolean;
  suspensionRoll?: number; // skew/roll value (-5 to 5)
  steeringAngle?: number;  // steering direction (-25 to 25)
  brakeGlow?: boolean;     // glowing brakes
  scrollProgress?: number; // to switch images correctly
}

export default function CarSVG({
  className = '',
  headlightGlow = true,
  wheelRotation = 0,
  suspensionRoll = 0,
  steeringAngle = 0,
  brakeGlow = false,
  scrollProgress = 0
}: CarSVGProps) {
  // Determine which angle image to display based on scrollProgress
  let carImg = carFront;
  let activeAngle = 'front-34';
  let underglowColor = 'rgba(245, 185, 66, 0.55)'; // default amber

  if (scrollProgress < 0.15) {
    // Scene 1: Hero Waiting
    carImg = carFront;
    activeAngle = 'front-34';
    underglowColor = 'rgba(245, 185, 66, 0.4)'; // soft amber
  } else if (scrollProgress < 0.38) {
    // Scene 2: About Drift Slide
    carImg = carSide;
    activeAngle = 'side';
    underglowColor = 'rgba(232, 51, 42, 0.65)'; // aggressive red drift
  } else if (scrollProgress < 0.62) {
    // Scene 3: Tech Stack Garage
    carImg = carFront;
    activeAngle = 'front-34';
    underglowColor = 'rgba(245, 185, 66, 0.5)'; // garage orange
  } else if (scrollProgress < 0.86) {
    // Scene 4: Project Highway
    carImg = carRearChase;
    activeAngle = 'rear-chase';
    underglowColor = 'rgba(56, 189, 248, 0.6)'; // cyan night highway speed
  } else {
    // Scene 5: Contact Parked
    carImg = carRear34;
    activeAngle = 'rear-34';
    underglowColor = 'rgba(232, 51, 42, 0.5)'; // parked brake red
  }

  // Calculate dynamic motion blur based on wheel rotation (representing speed)
  const motionBlurVal = Math.min(4, Math.max(0, (wheelRotation % 120) / 45));

  return (
    <div 
      className={`relative w-full h-auto select-none pointer-events-none ${className}`}
      style={{
        transform: `rotate(${suspensionRoll}deg) skewX(${steeringAngle * 0.1}deg)`,
        transition: 'transform 0.15s ease-out, filter 0.1s ease-out',
        filter: motionBlurVal > 0.5 ? `blur(${motionBlurVal * 0.4}px)` : 'none'
      }}
    >
      {/* 1. PROFESSIONAL DEEP GROUND COUPLING SHADOWS */}
      <div 
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[94%] h-[15%] rounded-[50%] bg-black/90 blur-md z-0"
        style={{
          boxShadow: '0 8px 16px 8px rgba(0,0,0,0.95)'
        }}
      />

      {/* 2. DYNAMIC NEON UNDERGLOW SYSTEM */}
      <div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-[10%] rounded-[50%] transition-all duration-300 ease-out z-0"
        style={{
          background: underglowColor,
          filter: 'blur(24px)',
          boxShadow: `0 0 40px 10px ${underglowColor}`
        }}
      />

      {/* 3. CORE REAL PHOTOGRAPHIC CAR IMAGE (Using Screen blend to strip pure black background) */}
      <div className="relative z-10 w-full overflow-hidden rounded-lg bg-black/10">
        <img 
          src={carImg} 
          alt="Premium Sports Coupe" 
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover block transition-all duration-300 ease-out"
          style={{
            mixBlendMode: 'screen',
            imageRendering: 'crisp-edges'
          }}
        />

        {/* 4. DYNAMIC LIGHTING LAYERS OVER PHOTOS */}
        
        {/* LED Headlight Beam / Flares for Front 3/4 and Front views */}
        {headlightGlow && (activeAngle === 'front-34') && (
          <>
            {/* Front Left Headlight lens flare */}
            <div 
              className="absolute w-24 h-24 bg-sky-300/60 rounded-full blur-[8px] mix-blend-screen pointer-events-none"
              style={{
                top: '52%',
                left: '12%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 60px 15px rgba(56, 189, 248, 0.8), 0 0 100px 30px rgba(255,255,255,1)'
              }}
            />
            {/* Front Right Headlight lens flare */}
            <div 
              className="absolute w-16 h-16 bg-sky-300/50 rounded-full blur-[6px] mix-blend-screen pointer-events-none"
              style={{
                top: '49%',
                left: '34%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 40px 10px rgba(56, 189, 248, 0.7), 0 0 80px 20px rgba(255,255,255,0.9)'
              }}
            />
            {/* Dynamic Forward Beam casting */}
            <div 
              className="absolute w-[300px] h-[100px] bg-gradient-to-r from-sky-400/20 via-sky-300/5 to-transparent blur-md pointer-events-none origin-left"
              style={{
                top: '48%',
                left: '10%',
                transform: 'rotate(-165deg)',
                clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)'
              }}
            />
          </>
        )}

        {/* Taillight / Brake LED Halos for Rear Chase View */}
        {(activeAngle === 'rear-chase') && (
          <>
            {/* Left Brake Light */}
            <div 
              className="absolute w-12 h-12 bg-red-600/70 rounded-full blur-[4px] mix-blend-screen transition-opacity duration-150"
              style={{
                top: '55%',
                left: '20%',
                transform: 'translate(-50%, -50%)',
                opacity: brakeGlow ? 1 : 0.4,
                boxShadow: brakeGlow 
                  ? '0 0 40px 10px rgba(239, 68, 68, 0.9), 0 0 15px 5px rgba(255, 255, 255, 0.8)' 
                  : '0 0 15px 3px rgba(220, 38, 38, 0.6)'
              }}
            />
            {/* Right Brake Light */}
            <div 
              className="absolute w-12 h-12 bg-red-600/70 rounded-full blur-[4px] mix-blend-screen transition-opacity duration-150"
              style={{
                top: '55%',
                right: '20%',
                transform: 'translate(50%, -50%)',
                opacity: brakeGlow ? 1 : 0.4,
                boxShadow: brakeGlow 
                  ? '0 0 40px 10px rgba(239, 68, 68, 0.9), 0 0 15px 5px rgba(255, 255, 255, 0.8)' 
                  : '0 0 15px 3px rgba(220, 38, 38, 0.6)'
              }}
            />
          </>
        )}

        {/* Taillight / Brake LED Halos for Rear 3/4 view */}
        {(activeAngle === 'rear-34') && (
          <>
            {/* Rear main tail light band */}
            <div 
              className="absolute w-16 h-8 bg-red-600/70 rounded-full blur-[6px] mix-blend-screen transition-opacity duration-150"
              style={{
                top: '47%',
                right: '18%',
                transform: 'translate(50%, -50%)',
                opacity: brakeGlow ? 1 : 0.4,
                boxShadow: brakeGlow 
                  ? '0 0 50px 15px rgba(239, 68, 68, 0.9), 0 0 20px 8px rgba(255, 255, 255, 0.8)' 
                  : '0 0 20px 4px rgba(220, 38, 38, 0.6)'
              }}
            />
          </>
        )}

        {/* Brake Disc Glow under the rims */}
        {brakeGlow && (
          <div 
            className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-color-dodge transition-opacity duration-200"
            style={{
              filter: 'blur(4px)'
            }}
          />
        )}
      </div>

      {/* 5. DYNAMIC ROTATION OVERLAYS FOR WHEELS (to simulate spinning rims) */}
      {motionBlurVal > 1 && (activeAngle === 'side') && (
        <>
          {/* Front wheel spin blur overlay */}
          <div 
            className="absolute bg-gradient-to-tr from-white/10 to-transparent border border-white/20 rounded-full blur-[1px] animate-spin"
            style={{
              top: '71%',
              left: '21.5%',
              width: '13%',
              height: '13%',
              transform: 'translate(-50%, -50%)',
              animationDuration: '0.1s'
            }}
          />
          {/* Rear wheel spin blur overlay */}
          <div 
            className="absolute bg-gradient-to-tr from-white/10 to-transparent border border-white/20 rounded-full blur-[1px] animate-spin"
            style={{
              top: '71%',
              left: '71.5%',
              width: '13%',
              height: '13%',
              transform: 'translate(-50%, -50%)',
              animationDuration: '0.08s'
            }}
          />
        </>
      )}
    </div>
  );
}
