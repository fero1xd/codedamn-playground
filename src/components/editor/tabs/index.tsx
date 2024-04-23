import { cn } from '@/lib/utils';
import { TextModel } from '../types';
import { getIcon } from '@/components/file-tree/icons';
import { monaco } from '../monaco';

type TabsProps = {
  openedModels: TextModel[] | undefined;
  activeModelUri?: monaco.Uri;

  onChangeModel(model: TextModel): void;
  closeModel(model: TextModel, index: number): void;
};

export function Tabs({
  openedModels,
  activeModelUri,
  onChangeModel,
  closeModel,
}: TabsProps) {
  return (
    <div className='w-full flex items-center border-b border-b-gray-800'>
      {openedModels &&
        openedModels.map((model, i) => {
          const uriString = model.uri.toString();
          const split = uriString.split('/');
          const modelName = split[split.length - 1];

          const selected = activeModelUri?.toString() === uriString;

          console.log(selected);

          return (
            <div
              key={model.uri.toString()}
              className={cn(
                'pr-10 pl-3 relative py-3 bg-transparent text-sm text-gray-500 flex items-center border-t gap-3 group border-b',
                selected &&
                  'text-white bg-[#0f111a] border-t-blue-500 border-b-transparent mb-[-2px] mt-[-2px]',
                'border-r border-r-gray-800'
              )}
              onClick={() => {
                if (!selected) onChangeModel(model);
              }}
            >
              <div className='flex items-center gap-2'>
                {getIcon(modelName.split('.')[1] || '', modelName, modelName)}
                <p>{modelName}</p>
                {selected && <span>selected</span>}
              </div>

              <span
                className={cn(
                  !selected && 'opacity-0',
                  'group-hover:opacity-100 cursor-pointer absolute right-3'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  closeModel(model, i);
                }}
              >
                <Cross />
              </span>
            </div>
          );
        })}
    </div>
  );
}

function Cross() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      stroke='currentColor'
      className={cn('w-4 h-4 mt-[4px]')}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 18 18 6M6 6l12 12'
      />
    </svg>
  );
}
