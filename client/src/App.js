
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PaginaPrincipal from './pages/layout/paginaPrincipal';
import ModuloEstudiantes from './pages/layout/moduloEstudiantes';
import ModuloTutores from './pages/layout/moduloTutores';


function App (){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/moduloTutores' element={<ModuloTutores/>}/>
        <Route path='/moduloEstudiantes' element={<ModuloEstudiantes/>}/>
        <Route path='/' element={<PaginaPrincipal/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;