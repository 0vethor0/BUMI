import React from 'react';
import './App.css'; // Asegúrate de que este archivo exista
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="logo">BUMI</div>
          <nav className="top-nav">
            
          </nav>
        </div>

        <div className="header-main">
          <div className="header-search-section">
            <h1>BUSCADOR DE MATERIAL DE INVESTIGACIÓN</h1>
            <p>
              Bumi es básicamente un Google Academy, un sitio web al cual puedes acceder desde cualquier parte del mundo para consultar los
              trabajos de investigación hechos por la comunidad de estudiantes e investigadores Unefista...
            </p>
            
            <div className="search-box">
              <input type="text" placeholder="¿Qué necesitas buscar?" />
              <button>Buscar</button>
            </div>
          </div>

          <div className="header-image-card">
            <img src="/images/logo.png" alt="BUMI Logo con birrete" className="card-image" />
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="how-to-use-section">
          <h2>¿Cómo debo usar BUMI?</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-icon"><i className="fas fa-search"></i></div>
              <h3>Describe lo que necesitas Buscar</h3>
              <p>
                Escribe en el buscador lo que deseas encontrar, puedes utilizar las herramientas de “búsqueda avanzada” para filtrar los
                resultados más específicos.
              </p>
            </div>

            <div className="step-item">
              <div className="step-icon"><i className="fas fa-filter"></i></div>
              <h3>Elige entre los resultados relacionados</h3>
              <p>
                Al igual que el buscador de Google, solo tienes que inspeccionar y elegir entre una lista de resultados relacionados
                para encontrar lo que estabas buscando.
              </p>
            </div>

            <div className="step-item">
              <div className="step-icon"><i className="fas fa-download"></i></div>
              <h3>Inspecciona y Descarga</h3>
              <p>
                Finalmente puedes consultar el archivo, tener acceso a su descripción, los documentos relacionados a él, podrás citarlo en
                formato APA y descargarlo en formato PDF.
              </p>
            </div>
          </div>
        </section>

        <section className="mission-vision-objectives-section">
          <h2>Misión, Visión y Objetivos</h2>
          <div className="mvo-content">
            <div className="mvo-image-container">
              <img src="/images/logo ING Sistemas.jpg" alt="Escudo de Ingeniería de Sistemas" className="mvo-image" />
              <div className="mvo-image-text">INGENIERÍA DE SISTEMAS</div>
            </div>

            <div className="mvo-text-container">
              <p>
                Los Estudiantes de Ingeniería de Sistemas promueven el desarrollo tecnológico, y con este sistema se plantea la digitalización
                de los recursos de investigación científica en la Universidad.
              </p>
              <div className="mvo-question-answer">
                <h4>¿A quién está dirigido Bumi?</h4>
                <p>
                  La galería de información de este sistema está abierta al público, es decir que cualquier persona tiene la capacidad de
                  consultar desde los trabajos de grado más recientes hasta los trabajos de pasantías más antiguos.
                </p>
              </div>

              <div className="mvo-question-answer">
                <h4>¿Cuál es el Objetivo de Bumi?</h4>
                <p>
                  El Objetivo General de Bumi es proporcionar en formato digital, toda la documentación realizada por la comunidad Unefista,
                  con el fin de facilitar la consulta de antecedentes de investigación.
                </p>
              </div>

              <div className="mvo-question-answer">
                <h4>¿Cuál es el futuro de Bumi?</h4>
                <p>
                  BUMI aspira a convertirse en el referente principal para la investigación académica en línea, expandiendo su base de datos
                  y funcionalidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="collective-need-section">
          <h2>Bumi surge de una necesidad Colectiva...</h2>
          <p>
            En un mundo cada vez más adentrado en la tecnología, la digitalización de recursos físicos es inevitable. Y cuando la tarea de consultar
            un trabajo de grado hecho por los estudiantes hace 5 o más años se vuelve tedioso, al tener que revisar el formato CD del trabajo.
            Pues en esos casos se pierde tiempo.
          </p>
          <div className="info-blocks-container">
            <div className="info-block">
              <div className="info-block-circle"></div>
              <h4>Ing. Maria Cabrera</h4>
              <p>
                “La universidad carece de un sistema que recopile todos los trabajos hechos por los estudiantes. Y a la hora de la verdad,
                no estamos capacitados, para responder a una emergencia de forma eficiente”
              </p>
            </div>

            <div className="info-block">
              <div className="info-block-circle"></div>
              <h4>Lic. Nayibe</h4>
              <p>
                “Es esencial un sistema de este tipo. Porque muchas veces cuando buscamos un antecedente, no es de interés leer todo el trabajo,
                en cambio, lo de interés radica en los datos puntuales como: el título, los objetivos, el resumen, entre otros”.
              </p>
            </div>

            <div className="info-block">
              <div className="info-block-circle"></div>
              <h4>Doc. Betty Juarez</h4>
              <p>
                “Un sistema para llevar el registro de proyectos de investigación, son muy útil para el proceso de consulta por parte de
                cualquier persona adentro y fuera de la universidad”.
              </p>
            </div>
          </div>
        </section>
      </main>

      
    </>
  );
}

export default App;