import React from 'react'

export default function Star({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.48 3.499a.75.75 0 0 1 1.04 0l2.606 2.512a.75.75 0 0 0 .424.216l3.624.526a.75.75 0 0 1 .416 1.279l-2.62 2.554a.75.75 0 0 0-.216.663l.619 3.61a.75.75 0 0 1-1.089.79l-3.244-1.705a.75.75 0 0 0-.698 0L8.04 16.649a.75.75 0 0 1-1.089-.79l.62-3.61a.75.75 0 0 0-.216-.663L4.737 8.031a.75.75 0 0 1 .416-1.279l3.624-.526a.75.75 0 0 0 .424-.216l2.28-2.511Z"/>
    </svg>
  )
}
