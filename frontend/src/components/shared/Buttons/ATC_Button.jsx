import React from 'react'

const Button = ({ label, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${className}`}
        >
            {label}
        </button>
    )
}

export default Button