'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import styles from '@/app/styles/Login.module.css'

interface LogicaMostrarPassProps {
    id: string;
    name?: string;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export default function LogicaMostrarPass({ 
    id, 
    name, 
    placeholder, 
    value, 
    onChange, 
    required, 
    children, 
    className,
    style
}: LogicaMostrarPassProps) {
    const [show, setShow] = useState(false)

    return (
        <div className={className} style={style}>
            <input
                id={id}
                name={name}
                type={show ? 'text' : 'password'}
                required={required}
                value={value}
                onChange={onChange}
                autoComplete="current-password"
                className={styles.input} 
            />
            <label htmlFor={id}>{placeholder}</label>
            
            <div 
                onClick={() => setShow(!show)}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '5px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="#000000" viewBox="0 0 24 24">
                        {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
                        <path d="m12,5c-1.84,0-3.35.39-4.62.97l-3.68-3.68-1.41,1.41,3.32,3.32c-2.61,1.95-3.54,4.62-3.56,4.66-.07.21-.07.43,0,.63.02.07,2.32,6.68,9.95,6.68,1.84,0,3.35-.39,4.62-.97l3.68,3.68,1.41-1.41-3.32-3.32c2.61-1.95,3.54-4.62,3.56-4.66.07-.21.07-.43,0-.63-.02-.07-2.32-6.68-9.95-6.68Zm-7.93,7c.1-.24.27-.59.52-.99l5.87,5.87c-4.21-.65-5.94-3.84-6.39-4.88Zm9.25,4.91l-7.48-7.48c.34-.34.74-.67,1.19-.98l8.05,8.05c-.53.19-1.12.33-1.76.41Zm3.65-1.35l-1.53-1.53c.61-1.03.71-2.28.31-3.38-.18.21-.45.36-.75.36-.55,0-1-.45-1-1,0-.44.29-.81.69-.94-1.32-1.21-3.23-1.37-4.71-.5l-1.06-1.06c.88-.31,1.9-.5,3.08-.5,5.35,0,7.42,3.85,7.93,5-.3.69-1.17,2.34-2.96,3.56Z"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="#000000" viewBox="0 0 24 24">
                        {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
                        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
                        <path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path>
                    </svg>
                )}
            </div>
            {children}
        </div>
    )
}
