import Canvas from './components/Canvas';
import MousePosition from './components/MousePosition';
import MousesRenderer from './components/MousesRenderer';
import SelectionBtns from './components/SelectionBtns';

const Board = () => (
  <>
    <Canvas />
    <MousePosition />
    <MousesRenderer />
    <SelectionBtns />
  </>
);

export default Board;
