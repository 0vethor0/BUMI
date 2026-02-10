'use client';

import Image from 'next/image';
import Header from '@/components/Header';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { listProjectsAction, searchProjectsAction, fetchAllAreasAction, filterProjectsAction } from '@/app/protected/actions';


const PaginaPrincipal = () => {
  const handleBuscarClick = () => {
    const searchInput = document.querySelector('input[placeholder="¿Qué necesitas buscar?"]');
    const searchTerm = searchInput?.value || '';
    
    if (searchTerm) {
      window.location.href = `/buscador?q=${encodeURIComponent(searchTerm)}`;
    } else {
      window.location.href = "/buscador";
      alert("No se encontraron coincidencias para la búsqueda");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background"> {/* Exacto Index.tsx */}
      <Header />
      <main className="flex-1"> {/* flex-1 para Footer sticky abajo */}
        {/* TU HERO/SEARCH (movido de viejo <header>, clases globals.css intactas) */}
        <header className="header"> {/* Mantengo tu .header globals (teal) */}
          <div className="header-main">
            <div className="header-search-section">
              <h1>BUSCADOR DE MATERIAL DE INVESTIGACIÓN</h1>
              <p>
                Bumi es básicamente un Google Academy, un sitio web al cual puedes
                acceder desde cualquier parte del mundo para consultar los
                trabajos de investigación hechos por la comunidad de estudiantes e
                investigadores Unefista.....
              </p>
              
              <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="¿Qué necesitas buscar?" aria-label="¿Qué necesitas buscar?" aria-describedby="button-addon2" />
                <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleBuscarClick}>Buscar</button>
              </div>
            </div>
            <div className="header-image-card">
              <Image
                src="/image/logo.png"
                alt="BUMI Logo con birrete"
                width={280}
                height={200}
                className="card-image"
              />
            </div>
          </div>
        </header>

        {/* TU MAIN CONTENT (intacto, globals.css) */}
        <main className="main-content">
          <section className="how-to-use-section">
            <h2>¿Cómo debo usar BUMI?</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>Describe lo que necesitas Buscar</h3>
                <p>
                  Escribe en el buscador lo que deseas encontrar, puedes utilizar
                  la herramientas de búsqueda avanzada para filtrar los
                  resultados más específicos.
                </p>
              </div>
              <div className="step-item">
                <div className="step-icon">
                  <i className="fas fa-filter"></i>
                </div>
                <h3>Elige entre los resultados relacionados</h3>
                <p>
                  Al igual que el buscador de Google, solo tienes que inspeccionar
                  y elegir entre una lista de resultados relacionados para
                  encontrar lo que estabas buscando.
                </p>
              </div>
              <div className="step-item">
                <div className="step-icon">
                  <i className="fas fa-download"></i>
                </div>
                <h3>Inspecciona y Descarga</h3>
                <p>
                  Finalmente puedes consultar el archivo, tener acceso a su
                  descripción, los documentos relacionados a él, podrás citarlo en
                  formato APA y descargarlo en formato PDF.
                </p>
              </div>
            </div>
          </section>

          <section className="mission-vision-objectives-section">
            <h2>Misión, Visión y Objetivos</h2>
            <div className="mvo-content">
              <div className="mvo-image-container">
                <Image
                  src="/image/logo ING Sistemas.jpg"
                  alt="Escudo de Ingeniería de Sistemas"
                  width={200}
                  height={200}
                  className="mvo-image"
                />
                <div className="mvo-image-text">INGENIERÍA DE SISTEMAS</div>
              </div>
              <div className="mvo-text-container">
                <p>
                  Los Estudiantes de Ingeniería de Sistemas promueven el
                  desarrollo tecnológico, y con este sistema se plantea la
                  digitalización de los recursos de investigación científica en la
                  Universidad
                </p>
                <div className="mvo-question-answer">
                  <h4>¿A quién está dirigido Bumi?</h4>
                  <p>
                    La galería de información de este sistema está abierto al
                    público, es decir que cualquier persona tiene la capacidad de
                    consultar desde los trabajos de grado más recientes hasta los
                    trabajos de pasantías más antiguos.
                  </p>
                </div>
                <div className="mvo-question-answer">
                  <h4>¿Cuál es el Objetivo de Bumi?</h4>
                  <p>
                    El Objetivo General de Bumi es proporcionar en formato
                    digital, toda la documentación realizada por la comunidad
                    Unefista, con el fin de facilitar la consulta de antecedentes
                    de investigación.
                  </p>
                </div>
                <div className="mvo-question-answer">
                  <h4>¿Cuál es el futuro de Bumi?</h4>
                  <p>
                    BUMI aspira a convertirse en el referente principal para la
                    investigación académica en línea, expandiendo su base de datos
                    y funcionalidades.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* REEMPLAZADO: Static collective-need → Testimonials dinámico (pixel-perfect) */}
          <Testimonials /> {/* id="contacto" o #manual si necesitas anchors */}
        </main>
      </main>
      <Footer />
    </div>
  );
};

export default PaginaPrincipal;
