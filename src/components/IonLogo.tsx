import React from 'react';
import ionLogoImage from '../assets/images/ion_logo_app_1786967721120.jpg';

interface IonLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  className?: string;
  variant?: 'image' | 'vector';
}

export const IonLogo: React.FC<IonLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  variant = 'image',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs': return { width: 110, height: 48, imgClass: 'h-8 w-auto' };
      case 'sm': return { width: 160, height: 70, imgClass: 'h-10 w-auto' };
      case 'md': return { width: 250, height: 110, imgClass: 'h-14 w-auto' };
      case 'lg': return { width: 330, height: 145, imgClass: 'h-20 w-auto' };
      case 'hero': return { width: 420, height: 185, imgClass: 'h-28 w-auto' };
    }
  };

  const dims = getDimensions();

  if (variant === 'image') {
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <img
          src={ionLogoImage}
          alt="ION - Clean Storage. Boost Speed."
          referrerPolicy="no-referrer"
          className={`${dims.imgClass} w-auto object-contain rounded-xl drop-shadow-sm transition-transform duration-200 hover:scale-[1.02]`}
        />
        {showTagline && size === 'xs' && (
          <div className="text-[9px] font-bold text-center mt-0.5 tracking-tight">
            <span className="text-blue-500">Clean Storage. </span>
            <span className="text-lime-500">Boost Speed.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 230"
        width={dims.width}
        height={dims.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300"
      >
        <defs>
          {/* Main 3D Blue Letter Body Gradient */}
          <linearGradient id="ionBodyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="25%" stopColor="#0044d6" />
            <stop offset="65%" stopColor="#022180" />
            <stop offset="100%" stopColor="#010f45" />
          </linearGradient>

          {/* Letter Rim Neon Cyan Glow */}
          <linearGradient id="ionNeonRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>

          {/* Glowing Green-to-Yellow Crescent Energy Arc */}
          <linearGradient id="ionArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="20%" stopColor="#00e676" />
            <stop offset="50%" stopColor="#76ff03" />
            <stop offset="80%" stopColor="#d4e157" />
            <stop offset="100%" stopColor="#ffd600" />
          </linearGradient>

          {/* Speed Stream Gradient */}
          <linearGradient id="ionSpeedStream" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00d2ff" stopOpacity="0" />
            <stop offset="40%" stopColor="#0099ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0055ff" stopOpacity="0.95" />
          </linearGradient>

          {/* 3D Golden Cube Gradient */}
          <linearGradient id="ionGoldCube" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff085" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* 3D Cyan Cube Gradient */}
          <linearGradient id="ionCyanCube" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Media Tile Dark Blue Gradient */}
          <linearGradient id="ionTileBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="50%" stopColor="#003db3" />
            <stop offset="100%" stopColor="#001a66" />
          </linearGradient>

          {/* Soft Glow Filter for Arc */}
          <filter id="ionArcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* 3D Drop Shadow */}
          <filter id="ion3DShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#010d2b" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Speed Stream Streak Lines */}
        <path d="M 55 54 C 105 48, 160 62, 205 80" stroke="url(#ionSpeedStream)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 80 84 C 128 82, 175 90, 210 106" stroke="url(#ionSpeedStream)" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M 70 120 C 115 120, 168 114, 205 114" stroke="url(#ionSpeedStream)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 80 150 C 122 152, 168 140, 208 130" stroke="url(#ionSpeedStream)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Floating Small Yellow / Golden 3D Micro Cubes */}
        <g transform="translate(198, 44) rotate(16)" filter="url(#ion3DShadow)">
          <rect width="14" height="14" rx="3.5" fill="url(#ionGoldCube)" />
          <rect width="14" height="14" rx="3.5" fill="none" stroke="#fde047" strokeWidth="1" opacity="0.9" />
        </g>
        <g transform="translate(144, 90) rotate(-12)" filter="url(#ion3DShadow)">
          <rect width="11" height="11" rx="2.5" fill="url(#ionGoldCube)" />
        </g>
        <g transform="translate(98, 142) rotate(15)" filter="url(#ion3DShadow)">
          <rect width="12" height="12" rx="3" fill="url(#ionGoldCube)" />
        </g>

        {/* Floating Small Cyan 3D Micro Cubes */}
        <g transform="translate(56, 36) rotate(-15)" filter="url(#ion3DShadow)">
          <rect width="11" height="11" rx="2.5" fill="url(#ionCyanCube)" />
        </g>
        <g transform="translate(84, 130) rotate(12)">
          <rect width="10" height="10" rx="2" fill="url(#ionCyanCube)" />
        </g>
        <g transform="translate(182, 136) rotate(-8)">
          <rect width="13" height="13" rx="3" fill="url(#ionCyanCube)" />
        </g>
        <g transform="translate(180, 162) rotate(20)">
          <rect width="11" height="11" rx="2.5" fill="url(#ionCyanCube)" />
        </g>

        {/* 3D Floating Media Badges */}
        <g transform="translate(74, 20) rotate(-14)" filter="url(#ion3DShadow)">
          <rect width="36" height="36" rx="8" fill="url(#ionTileBlue)" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 8 26 L 15 17 L 22 23 L 28 15 L 30 26 Z" fill="#ffffff" opacity="0.95" />
          <circle cx="13" cy="12" r="3.2" fill="#facc15" />
        </g>

        <g transform="translate(140, 32) rotate(-8)" filter="url(#ion3DShadow)">
          <rect width="38" height="38" rx="8" fill="url(#ionTileBlue)" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 8 28 L 16 18 L 24 25 L 29 17 L 31 28 Z" fill="#ffffff" opacity="0.95" />
          <circle cx="14" cy="13" r="3.4" fill="#facc15" />
        </g>

        <g transform="translate(108, 66) rotate(6)" filter="url(#ion3DShadow)">
          <rect width="34" height="34" rx="8" fill="url(#ionTileBlue)" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="12,10 26,17 12,24" fill="#ffffff" />
        </g>

        <g transform="translate(85, 102) rotate(-6)" filter="url(#ion3DShadow)">
          <rect width="32" height="34" rx="7" fill="url(#ionTileBlue)" stroke="#67e8f9" strokeWidth="2" />
          <line x1="8" y1="10" x2="24" y2="10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="16" x2="24" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="22" x2="18" y2="22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <g transform="translate(95, 138) rotate(10)" filter="url(#ion3DShadow)">
          <rect width="32" height="32" rx="7" fill="url(#ionTileBlue)" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 11 22 C 11 20, 14 18, 16 20 L 16 10 L 23 8 L 23 18 C 23 16, 21 16, 20 17" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform="translate(132, 152) rotate(-5)" filter="url(#ion3DShadow)">
          <rect width="36" height="32" rx="7" fill="url(#ionTileBlue)" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 9 12 L 14 12 L 17 14 L 27 14 C 28 14, 29 15, 29 16 L 29 23 C 29 24, 28 25, 27 25 L 9 25 C 8 25, 7 24, 7 23 L 7 14 C 7 13, 8 12, 9 12 Z" fill="#ffffff" />
        </g>

        {/* LETTER 'I' */}
        <g transform="translate(24, 70)" filter="url(#ion3DShadow)">
          <rect x="0" y="0" width="48" height="114" rx="15" fill="url(#ionBodyBlue)" stroke="#004cd4" strokeWidth="2.5" />
          <rect x="0" y="0" width="48" height="114" rx="15" fill="none" stroke="url(#ionNeonRim)" strokeWidth="2" opacity="0.9" />
          <rect x="4" y="4" width="40" height="106" rx="11" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          <line x1="8" y1="12" x2="8" y2="102" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* LETTER 'O' */}
        <g transform="translate(285, 126)">
          <circle cx="0" cy="0" r="64" stroke="url(#ionArcGradient)" strokeWidth="22" fill="none" opacity="0.25" filter="url(#ionArcGlow)" />

          <g filter="url(#ion3DShadow)">
            <path
              d="
                M -54 -12 L -68 -10 L -68 10 L -54 12
                L -52 26 L -64 36 L -54 48 L -40 40
                L -30 52 L -32 66 L -16 68 L -12 55
                L 0 56 L 0 40
                L -14 38 C -28 35 -40 22 -40 4 C -40 -14 -28 -28 -14 -32
                L 0 -36 L 0 -54
                L -12 -52 L -18 -66 L -32 -62 L -38 -48
                L -52 -38 L -64 -28 L -54 -18
                Z
              "
              fill="url(#ionBodyBlue)"
              stroke="#0062ff"
              strokeWidth="2.5"
            />
            <path
              d="M -50 24 L -62 34 L -52 46 L -38 38"
              stroke="#38bdf8"
              strokeWidth="2.2"
              fill="none"
            />
          </g>

          <path
            d="
              M 0 -60
              C 38 -60, 68 -30, 68 4
              C 68 38, 38 66, 0 66
              L 0 44
              C 24 44, 44 24, 44 4
              C 44 -16, 24 -38, 0 -38
              Z
            "
            fill="url(#ionArcGradient)"
            filter="url(#ionArcGlow)"
          />

          <circle cx="0" cy="4" r="28" fill="#ffffff" className="dark:fill-slate-900" />
          <circle cx="0" cy="4" r="24" fill="url(#ionBodyBlue)" />
          <circle cx="0" cy="4" r="18" fill="#ffffff" className="dark:fill-slate-900" />
          <circle cx="0" cy="4" r="14" fill="none" stroke="#00d2ff" strokeWidth="3" />
        </g>

        {/* LETTER 'N' */}
        <g transform="translate(378, 70)" filter="url(#ion3DShadow)">
          <rect x="0" y="0" width="36" height="114" rx="11" fill="url(#ionBodyBlue)" stroke="#004cd4" strokeWidth="2.5" />
          <path d="M 4 8 L 76 106 L 98 106 L 26 8 Z" fill="url(#ionBodyBlue)" />
          <rect x="70" y="0" width="36" height="114" rx="11" fill="url(#ionBodyBlue)" stroke="#004cd4" strokeWidth="2.5" />
          <rect x="0" y="0" width="36" height="114" rx="11" fill="none" stroke="url(#ionNeonRim)" strokeWidth="2" opacity="0.9" />
          <rect x="70" y="0" width="36" height="114" rx="11" fill="none" stroke="url(#ionNeonRim)" strokeWidth="2" opacity="0.9" />
          <line x1="9" y1="12" x2="74" y2="106" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* BOTTOM TAGLINE */}
        {showTagline && (
          <g transform="translate(270, 210)">
            <line x1="-240" y1="-5" x2="-145" y2="-5" stroke="#00c6ff" strokeWidth="3.5" strokeLinecap="round" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-black italic tracking-wide"
              style={{
                fontSize: '20px',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 900,
              }}
            >
              <tspan fill="#0099ff">Clean Storage. </tspan>
              <tspan fill="#76c800">Boost Speed.</tspan>
            </text>
            <line x1="145" y1="-5" x2="240" y2="-5" stroke="#b4ec0e" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
