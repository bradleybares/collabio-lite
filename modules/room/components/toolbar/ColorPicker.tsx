import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { RgbaColorPicker } from 'react-colorful';
import { useClickAway } from 'react-use';

import { getStringFromRgba } from '@/common/lib/rgba';
import { useOptions } from '@/common/recoil/options/options.hooks';

import { EntryAnimation } from '../../animations/Entry.animations';

const ColorPicker = () => {
  const [options, setOptions] = useOptions();

  const ref = useRef<HTMLDivElement>(null);

  const [opened, setOpened] = useState(false);

  useClickAway(ref, () => setOpened(false));

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        className="h-6 w-6 rounded-full border-2 border-white transition-all hover:scale-125 active:scale-100"
        style={{ backgroundColor: getStringFromRgba(options.lineColor) }}
        onClick={() => setOpened(!opened)}
      />
      <AnimatePresence>
        {opened && (
          <motion.div
            className="absolute top-0 left-14"
            variants={EntryAnimation}
            initial="from"
            animate="to"
            exit="from"
          >
            <RgbaColorPicker
              color={options.lineColor}
              onChange={(e) => {
                setOptions({
                  ...options,
                  lineColor: e,
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorPicker;
