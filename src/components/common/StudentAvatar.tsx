import React from 'react';

interface StudentAvatarProps {
  name: string;
  src?: string | null;
  className: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({ name, src, className }) => {
  if (src) return <img src={src} alt={name} className={className} />;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <span aria-label={name} className={`${className} flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold`}>
      {initials || '?'}
    </span>
  );
};