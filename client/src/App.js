
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PaginaPrincipal from './pages/layout/paginaPrincipal';
import ModuloEstudiantes from './pages/layout/moduloEstudiantes';
import ModuloTutores from './pages/layout/moduloTutores';
import Login from './pages/layout/login';
import ModuloProyectos from './pages/layout/moduloProyectos';


function App (){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/moduloTutores' element={<ModuloTutores/>}/>
        <Route path='/moduloEstudiantes' element={<ModuloEstudiantes/>}/>
        <Route path='/moduloProyectos' element={<ModuloProyectos/>}/>
        <Route path='/' element={<PaginaPrincipal/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;