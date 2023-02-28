import { useState } from 'react';

import { DEFAULT_MOVE } from '@/common/constants/defaultMove';
import { useViewportSize } from '@/common/hooks/useViewportSize';
import { getPos } from '@/common/lib/getPos';
import { getStringFromRgba } from '@/common/lib/rgba';
import { socket } from '@/common/lib/socket';
import { useOptionsValue } from '@/common/recoil/options';
import { useSetSavedMoves } from '@/common/recoil/savedMoves';
import { Move } from '@/common/types/global';

import { drawRect, drawCircle, drawLine } from '../helpers/Canvas.helpers';
import { useBoardPosition } from './useBoardPosition';
import { useCtx } from './useCtx';

let tempMoves: [number, number][] = [];
let tempCircle = { cX: 0, cY: 0, radiusX: 0, radiusY: 0 };
let tempSize = { width: 0, height: 0 };
let tempImageData: ImageData | undefined;

export const useDraw = (blocked: boolean) => {
  const options = useOptionsValue();
  const boardPosition = useBoardPosition();
  const { clearSavedMoves } = useSetSavedMoves();
  const vw = useViewportSize();

  const movedX = boardPosition.x;
  const movedY = boardPosition.y;

  const [drawing, setDrawing] = useState(false);
  const ctx = useCtx();

  const setupCtxOptions = () => {
    if (ctx) {
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = getStringFromRgba(options.lineColor);
      ctx.fillStyle = getStringFromRgba(options.fillColor);
      if (options.mode === 'eraser')
        ctx.globalCompositeOperation = 'destination-out';
      else ctx.globalCompositeOperation = 'source-over';
    }
  };

  const drawAndSet = () => {
    if (!tempImageData)
      tempImageData = ctx?.getImageData(
        movedX.get() * -1,
        movedY.get() * -1,
        vw.width,
        vw.height
      );

    if (tempImageData)
      ctx?.putImageData(tempImageData, movedX.get() * -1, movedY.get() * -1);
  };

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx || blocked || blocked) return;

    const [finalX, finalY] = [getPos(x, movedX), getPos(y, movedY)];

    setDrawing(true);
    setupCtxOptions();
    drawAndSet();

    if (options.shape === 'line') {
      ctx.beginPath();
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
    }

    tempMoves.push([finalX, finalY]);
  };

  const handleDraw = (x: number, y: number, shift?: boolean) => {
    if (!ctx || !drawing || blocked) return;

    const [finalX, finalY] = [getPos(x, movedX), getPos(y, movedY)];

    drawAndSet();

    switch (options.shape) {
      case 'line':
        if (shift) tempMoves = tempMoves.slice(0, 1);

        drawLine(ctx, tempMoves[0], finalX, finalY, shift);

        tempMoves.push([finalX, finalY]);
        break;

      case 'circle':
        tempCircle = drawCircle(ctx, tempMoves[0], finalX, finalY, shift);
        break;

      case 'rect':
        tempSize = drawRect(ctx, tempMoves[0], finalX, finalY, shift);
        break;

      default:
        break;
    }
  };

  const clearOnYourMove = () => {
    drawAndSet();
    tempImageData = undefined;
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;

    setDrawing(false);

    ctx.closePath();

    const move: Move = {
      ...DEFAULT_MOVE,
      rect: {
        ...tempSize,
      },
      circle: {
        ...tempCircle,
      },
      path: tempMoves,
      options,
    };

    tempMoves = [];
    tempCircle = { cX: 0, cY: 0, radiusX: 0, radiusY: 0 };
    tempSize = { width: 0, height: 0 };

    socket.emit('draw', move);
    clearSavedMoves();
  };

  return {
    handleEndDrawing,
    handleDraw,
    handleStartDrawing,
    drawing,
    clearOnYourMove,
  };
};
