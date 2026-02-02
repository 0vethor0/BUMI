"use client";
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../app/styles/Testimonials.module.css';

    const testimonials = [
    {
        name: 'Ing. Maria Cabrera',
        role: 'UNEFA 2020',
        borderColor: '#e74c3c',
        quote: '"La universidad posee de un sistema que resuelve todos los dolores de cabeza por los estudiantes. Y a la hora de la verdad, un sistema capaz de para resolver a una emergencia de forma eficiente"'
    },
    {
        name: 'Lic. Nayeli',
        role: 'UNEFA 2024',
        borderColor: '#49b5ac',
        quote: '"Es esencial un sistema de este tipo. Porque muchas veces cuando buscamos un antecedente, no está claro en todo el trabajo, en general, lo de internet incluido y en ciertos puntuales como: el título, los objetivos, el resumen, entre otros"'
    },
    {
        name: 'Doctora Betty Juarez',
        role: 'UNEFA 2025',
        borderColor: '#f1c40f',
        quote: '"Un sistema para llevar el registro de proyectos de investigación, con muy útil para el proceso de consulta por parte de cualquier persona externay y dentro de la universidad"'
    }
    ];

    const Testimonials = () => {
        const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className={styles.section}>
        <div className={styles.container}>
            <div className={styles.header}>
            <h2 className={styles.title}>Bumi surge de una</h2>
            <h2 className={styles.titleHighlight}>necesidad Colectiva...</h2>
            <p className={styles.subtitle}>
                En un mundo cada vez más adentrando en la tecnología, la digitalización de recursos físicos es inevitable. Y cuando la tarea de
                consultar un trabajo de grado hecho por los estudiantes hace 20 más atrás se vuelve tediosa, al tener que revisar el formato CD
                del trabajo. Pues en esos casos en perjudicó tiempo.
            </p>
            </div>

            <div className={styles.carousel}>
            <div className={styles.cardsContainer}>
                {testimonials.map((testimonial, index) => {
                const position = index - currentIndex;
                const isActive = index === currentIndex;
                
                return (
                    <div 
                    key={index}
                    className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                    style={{ 
                        transform: `translateX(${position * 110}%)`,
                        opacity: Math.abs(position) <= 1 ? (isActive ? 1 : 0.6) : 0,
                        zIndex: isActive ? 10 : 5
                    }}
                    >
                    <div className={styles.cardHeader}>
                        <div 
                        className={styles.avatar}
                        style={{ borderColor: testimonial.borderColor }}
                        />
                        <div>
                        <h4 className={styles.cardName}>{testimonial.name}</h4>
                        <p className={styles.cardRole}>{testimonial.role}</p>
                        </div>
                    </div>
                    <p className={styles.cardQuote}>{testimonial.quote}</p>
                    </div>
                );
                })}
            </div>

            <div className={styles.carouselControls}>
                <div className={styles.dots}>
                {testimonials.map((_, index) => (
                    <button
                    key={index}
                    className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
                </div>
                <div className={styles.arrows}>
                <button onClick={prevSlide} className={styles.arrow} aria-label="Previous">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide} className={styles.arrow} aria-label="Next">
                    <ChevronRight size={20} />
                </button>
                </div>
            </div>
            </div>
        </div>
        </section>
    );
    };

export default Testimonials;
