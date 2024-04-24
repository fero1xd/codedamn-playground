import { Checkmark } from '@/components/ui/checkmark';
import { Spinner } from '@/components/ui/loading';
import { X } from '@/components/ui/X';
import { cn } from '@/lib/utils';

const states = [
  { message: 'Sending container request', loading: false, success: true },
  { message: 'Connecting to your container', loading: false, success: false },
  { message: 'Requesting terminal access', loading: true, success: true },
  { message: 'Setting up your code editor', loading: false, success: true },
];

export function LoadingPanel() {
  return (
    <div className='z-[100] min-h-screen w-full absolute bg-black flex flex-col justify-center'>
      <div className='flex flex-col items-start justify-center ml-auto mr-auto gap-3'>
        {states.map((state) => (
          <div className='flex gap-4 items-center justify-center'>
            {state.loading ? (
              <Spinner className='w-[30px]' />
            ) : state.success ? (
              <Checkmark className='w-[30px] h-[30px] stroke-green-500' />
            ) : (
              <X className='stroke-red-500 w-[30px] h-[30px]' />
            )}
            <p
              className={cn(
                'text-lg',
                !state.loading && state.success && 'text-green-500',
                !state.loading && !state.success && 'text-red-500'
              )}
            >
              {state.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
