import { CreatePlayground } from "@/components/create-playground";
import { Spinner } from "@/components/ui/loading";
import { Separator } from "@/components/ui/separator";
import { getAllPlaygrounds } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["playgrounds"],
      queryFn: getAllPlaygrounds,
    });
  },
});

function Index() {
  const { data, isLoading } = useQuery({
    queryKey: ["playgrounds"],
    queryFn: getAllPlaygrounds,
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="h-screen w-full p-4 pt-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-2xl">Available Playgrounds</h1>

        <CreatePlayground />
      </div>
      <Separator className="mb-8" />

      <div className="flex flex-col gap-5">
        {data?.map((pg) => {
          const createdAt = new Date(pg.createdAt);
          const diff = Math.abs(new Date().getTime() - createdAt.getTime());

          const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

          return (
            <Link
              key={pg.id}
              to="/playground/$pgId"
              params={{
                pgId: pg.id,
              }}
            >
              <div
                key={pg.id}
                className="flex items-center justify-between border rounded-md p-5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {pg.template === "typescript" && (
                    <svg
                      className="w-12"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="typescript">
                        <path
                          id="Combined Shape"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13 4C13 3.44772 12.5523 3 12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4ZM8.86927 10.6553L8.86995 10.6556L8.66667 11.3907C8.79166 11.4504 8.96527 11.5063 9.18748 11.5583C9.4097 11.6103 9.64563 11.6364 9.89527 11.6364C10.4866 11.6364 10.9246 11.5148 11.2093 11.2717C11.494 11.0286 11.6364 10.741 11.6364 10.4087C11.6367 10.1263 11.5459 9.88953 11.364 9.69849C11.182 9.50745 10.8985 9.3475 10.5135 9.21866C10.2312 9.11933 10.0277 9.03254 9.90309 8.95828C9.77844 8.88402 9.71611 8.78485 9.71611 8.66077C9.71611 8.55668 9.76767 8.46623 9.8708 8.38943C9.97392 8.31264 10.1312 8.27424 10.3427 8.27424C10.5541 8.27424 10.7359 8.29661 10.888 8.34136C11.04 8.3861 11.1595 8.42831 11.2463 8.46798L11.4661 7.74633C11.3362 7.69175 11.1803 7.64462 10.9984 7.60496C10.8164 7.56529 10.6034 7.54545 10.3593 7.54545C9.84927 7.54577 9.44772 7.65986 9.15467 7.88771C8.86163 8.11556 8.7151 8.39816 8.7151 8.7355C8.7151 9.02302 8.825 9.2623 9.04478 9.45334C9.26457 9.64438 9.55345 9.7994 9.91142 9.91841C10.1718 9.99775 10.3576 10.0796 10.4687 10.164C10.5798 10.2484 10.6354 10.3502 10.6354 10.4692C10.6354 10.598 10.577 10.7021 10.4604 10.7814C10.3437 10.8608 10.1741 10.9004 9.95152 10.9004C9.74007 10.9004 9.53799 10.8757 9.34529 10.8262C9.15294 10.7768 8.99449 10.7199 8.86995 10.6556L8.87031 10.6543L8.86927 10.6553ZM6.54 8.2375V11.6364H7.40233V8.2375H8.66668V7.54545H5.27274V8.2375H6.54Z"
                          fill="#3965BD"
                        />
                      </g>
                    </svg>
                  )}

                  {pg.template === "reactypescript" && (
                    <svg
                      className="w-12"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="react">
                        <path
                          id="Vector"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.99304 11.9444C8.40983 12.3565 8.813 12.677 9.20254 12.9058C9.59208 13.1347 9.94974 13.2494 10.2755 13.25C10.3752 13.25 10.4749 13.2383 10.5746 13.215C10.6743 13.1916 10.7651 13.1518 10.8468 13.0954C11.1366 12.9271 11.3337 12.6324 11.4381 12.2112C11.5424 11.7901 11.5447 11.2707 11.445 10.6531C11.427 10.5405 11.4068 10.4281 11.3842 10.3161C11.3615 10.2041 11.3366 10.0918 11.3094 9.97914C11.4184 9.9414 11.5247 9.90635 11.6285 9.874C11.7322 9.84166 11.8343 9.80661 11.9346 9.76887C12.505 9.54422 12.9397 9.28214 13.2388 8.98261C13.5379 8.68308 13.6875 8.36018 13.6875 8.01393C13.6875 7.66767 13.5379 7.34478 13.2388 7.04525C12.9397 6.74572 12.505 6.48363 11.9346 6.25899C11.8349 6.22125 11.7328 6.1838 11.6285 6.14666C11.5241 6.10952 11.4178 6.07687 11.3094 6.04872C11.3366 5.93609 11.3615 5.82377 11.3842 5.71175C11.4068 5.59972 11.427 5.49219 11.445 5.38915C11.5354 4.75235 11.5308 4.22129 11.4311 3.79596C11.3314 3.37062 11.1366 3.07349 10.8468 2.90456C10.7564 2.84825 10.6613 2.80841 10.5616 2.78505C10.4619 2.76168 10.3622 2.75 10.2625 2.75C9.9454 2.75 9.58976 2.86472 9.19558 3.09416C8.8014 3.3236 8.40056 3.64409 7.99304 4.05565C7.58553 3.6435 7.187 3.323 6.79746 3.09416C6.40792 2.86532 6.05026 2.7506 5.72448 2.75C5.62477 2.75 5.52507 2.76168 5.42536 2.78505C5.32566 2.80841 5.23494 2.84825 5.15321 2.90456C4.86337 3.07289 4.66628 3.36763 4.56194 3.78877C4.45759 4.20991 4.45528 4.72929 4.55498 5.34692C4.57295 5.45954 4.59324 5.57187 4.61585 5.68389C4.63845 5.79591 4.66338 5.90824 4.69062 6.02086C4.58165 6.0586 4.47527 6.09365 4.37151 6.12599C4.26775 6.15834 4.16573 6.19339 4.06544 6.23113C3.49504 6.45578 3.06028 6.71786 2.76117 7.01739C2.46206 7.31692 2.3125 7.63982 2.3125 7.98607C2.3125 8.33233 2.46206 8.65522 2.76117 8.95475C3.06028 9.25428 3.49504 9.51637 4.06544 9.74101C4.16515 9.77876 4.26717 9.8162 4.37151 9.85334C4.47585 9.89048 4.58222 9.92313 4.69062 9.95128C4.66338 10.0639 4.63845 10.1762 4.61585 10.2883C4.59324 10.4003 4.57295 10.5078 4.55498 10.6108C4.46455 11.2285 4.46919 11.7503 4.56889 12.1762C4.6686 12.6021 4.86337 12.8993 5.15321 13.0676C5.23494 13.1143 5.32566 13.1518 5.42536 13.1799C5.52507 13.2081 5.62477 13.2221 5.72448 13.2221C6.05084 13.2317 6.4085 13.1218 6.79746 12.8924C7.18642 12.6629 7.58495 12.3469 7.99304 11.9444ZM7.36786 10.3853C7.47684 10.3949 7.58321 10.3997 7.68697 10.3997H8.31216C8.31216 10.3997 8.41853 10.3949 8.63127 10.3853C8.52229 10.5255 8.41592 10.6588 8.31216 10.7852C8.20839 10.9116 8.10202 11.0356 7.99304 11.1572C7.89334 11.0356 7.79132 10.9116 7.68697 10.7852C7.58263 10.6588 7.47626 10.5255 7.36786 10.3853ZM5.98272 9.19198C6.04591 9.29501 6.10243 9.39326 6.15228 9.48671C6.20213 9.58017 6.25865 9.67392 6.32184 9.76797C6.14967 9.73982 5.98214 9.71166 5.81926 9.68351C5.65637 9.65535 5.49782 9.6227 5.34363 9.58556C5.38885 9.43579 5.44102 9.27914 5.50014 9.1156C5.55927 8.95205 5.62043 8.79061 5.68361 8.63126C5.72883 8.72471 5.77636 8.81846 5.82621 8.91252C5.87606 9.00657 5.92823 9.10032 5.98272 9.19377V9.19198ZM5.34363 6.41175C5.49782 6.374 5.65637 6.34136 5.81926 6.3138C5.98214 6.28624 6.14967 6.25809 6.32184 6.22933L6.15837 6.51059C6.15837 6.51059 6.09953 6.60884 5.98185 6.80533C5.92737 6.89878 5.87519 6.99253 5.82534 7.08659C5.77549 7.18064 5.72796 7.27888 5.68274 7.38132C5.61028 7.21299 5.54681 7.04675 5.49232 6.88261C5.43783 6.71846 5.38798 6.56181 5.34276 6.41264L5.34363 6.41175ZM5.9549 7.99865C6.02736 7.8393 6.10214 7.68265 6.17923 7.52869C6.25633 7.37473 6.3401 7.21808 6.43052 7.05873L6.70268 6.60944C6.70268 6.60944 6.79775 6.45967 6.98788 6.16014C7.15077 6.14157 7.31598 6.12989 7.48351 6.1251C7.65103 6.1203 7.82088 6.11791 7.99304 6.11791C8.17448 6.11791 8.34897 6.1203 8.51649 6.1251C8.68402 6.12989 8.84923 6.14157 9.01212 6.16014C9.1211 6.30991 9.21848 6.45967 9.30427 6.60944C9.39007 6.7592 9.47847 6.90896 9.56948 7.05873C9.6599 7.21808 9.74367 7.37473 9.82077 7.52869C9.89786 7.68265 9.97264 7.8393 10.0451 7.99865L9.82077 8.46232C9.82077 8.46232 9.737 8.61688 9.56948 8.92599L9.29732 9.37529C9.29732 9.37529 9.20225 9.52505 9.01212 9.82458C8.84923 9.84315 8.68402 9.85484 8.51649 9.85963C8.34897 9.86442 8.17448 9.86682 7.99304 9.86682C7.82088 9.86682 7.65103 9.86442 7.48351 9.85963C7.31598 9.85484 7.15077 9.84315 6.98788 9.82458C6.8789 9.67482 6.78152 9.52505 6.69573 9.37529C6.60993 9.22552 6.52153 9.07576 6.43052 8.92599C6.33952 8.77623 6.25575 8.62167 6.17923 8.46232L5.9549 7.99865ZM10.3303 7.36694L10.0181 6.79095C9.96366 6.68791 9.91148 6.59206 9.86163 6.5034C9.81178 6.41474 9.75526 6.32338 9.69208 6.22933C9.86424 6.2479 10.0318 6.27127 10.1947 6.29942C10.3575 6.32758 10.5161 6.36023 10.6703 6.39737C10.6251 6.55672 10.5729 6.71816 10.5138 6.88171C10.4546 7.04525 10.3935 7.2067 10.3303 7.36605V7.36694ZM10.3303 8.61688C10.3935 8.77623 10.4546 8.93768 10.5138 9.10122C10.5729 9.26476 10.6251 9.42142 10.6703 9.57118C10.5161 9.60892 10.3575 9.64157 10.1947 9.66913C10.0318 9.69668 9.86424 9.72484 9.69208 9.75359L9.85555 9.47234C9.85555 9.47234 9.91004 9.37409 10.019 9.1776C10.0735 9.09313 10.1257 9.00417 10.1755 8.91072C10.2254 8.81727 10.2776 8.71902 10.332 8.61598L10.3303 8.61688ZM10.5885 12.6318C10.5433 12.6599 10.4935 12.6788 10.439 12.6884C10.3845 12.698 10.3257 12.7028 10.2625 12.7028C9.99061 12.7028 9.68947 12.5973 9.35905 12.3865C9.02864 12.1756 8.6959 11.897 8.36085 11.5508C8.52374 11.3729 8.6846 11.1832 8.84343 10.982C9.00226 10.7807 9.15848 10.5677 9.3121 10.3431C9.57469 10.3149 9.83062 10.2823 10.0799 10.2451C10.3291 10.208 10.5714 10.1565 10.8068 10.0906C10.834 10.1936 10.8566 10.299 10.8746 10.4069C10.8926 10.5147 10.9108 10.6201 10.9294 10.7232C11.0111 11.2102 11.0224 11.6221 10.9633 11.9587C10.9042 12.2954 10.7796 12.52 10.5894 12.6327L10.5885 12.6318ZM11.1589 6.53845C11.7931 6.72595 12.2867 6.9506 12.6397 7.21239C12.9928 7.47418 13.1693 7.73626 13.1693 7.99865C13.1693 8.2233 13.0446 8.44315 12.7954 8.65822C12.5461 8.87328 12.1951 9.06977 11.7424 9.24769C11.652 9.28543 11.5592 9.32047 11.4641 9.35282C11.3691 9.38517 11.2671 9.41573 11.1581 9.44448C11.0856 9.21025 11.0042 8.97152 10.9137 8.72831C10.8233 8.48509 10.7236 8.24157 10.6146 7.99775C10.7236 7.74495 10.8256 7.49694 10.9207 7.25372C11.0158 7.01051 11.0949 6.77178 11.1581 6.53755L11.1589 6.53845ZM10.2755 3.28107C10.33 3.28107 10.3845 3.28586 10.439 3.29544C10.4935 3.30503 10.5433 3.32839 10.5885 3.36553C10.7787 3.46857 10.9056 3.68633 10.9694 4.01881C11.0332 4.35128 11.0242 4.76553 10.9424 5.26155C10.9245 5.36459 10.9042 5.46763 10.8816 5.57067C10.859 5.67371 10.8387 5.78124 10.8207 5.89326C10.5854 5.83695 10.3431 5.79022 10.0938 5.75308C9.84453 5.71594 9.5886 5.68329 9.32601 5.65513C9.17182 5.4209 9.01559 5.20315 8.85734 5.00186C8.69909 4.80058 8.53823 4.61098 8.37476 4.43306C8.70981 4.09579 9.04052 3.81962 9.36688 3.60456C9.69324 3.3895 9.9967 3.28196 10.2773 3.28196L10.2755 3.28107ZM8.63214 5.59763C8.52316 5.59763 8.41679 5.59523 8.31303 5.59044C8.20926 5.58564 8.10289 5.58325 7.99391 5.58325C7.89421 5.58325 7.79219 5.58564 7.68784 5.59044C7.5835 5.59523 7.47713 5.59763 7.36873 5.59763C7.47771 5.45745 7.58408 5.32415 7.68784 5.19775C7.79161 5.07135 7.89363 4.94735 7.99391 4.82574C8.10289 4.94735 8.20926 5.07375 8.31303 5.20494C8.41679 5.33614 8.52316 5.46733 8.63214 5.59852V5.59763ZM5.41145 3.36553C5.45667 3.32779 5.50652 3.30443 5.56101 3.29544C5.6155 3.28646 5.67434 3.28166 5.73752 3.28107C6.00939 3.28107 6.31053 3.3865 6.64095 3.59737C6.97136 3.80824 7.3041 4.0868 7.63915 4.43306C7.47626 4.61098 7.3154 4.80058 7.15657 5.00186C6.99774 5.20315 6.84152 5.4209 6.6879 5.65513C6.42531 5.67371 6.16938 5.70426 5.92012 5.74679C5.67086 5.78932 5.42855 5.83845 5.1932 5.89416C5.16596 5.79112 5.14335 5.68569 5.12538 5.57786C5.10741 5.47003 5.08915 5.36459 5.0706 5.26155C4.98887 4.77452 4.97756 4.36506 5.03669 4.03318C5.09582 3.70131 5.22045 3.47905 5.41058 3.36643L5.41145 3.36553ZM4.84105 9.44448C4.20688 9.26656 3.71329 9.04431 3.36027 8.77773C3.00724 8.51115 2.83073 8.25145 2.83073 7.99865C2.83073 7.774 2.95536 7.55175 3.20462 7.3319C3.45388 7.11205 3.80488 6.91316 4.25761 6.73524C4.34804 6.6975 4.44078 6.66245 4.53585 6.6301C4.63092 6.59775 4.73294 6.5672 4.84192 6.53845C4.91438 6.77268 4.99582 7.0114 5.08625 7.25462C5.17668 7.49784 5.27639 7.74585 5.38537 7.99865C5.27639 8.24187 5.17436 8.48748 5.0793 8.73549C4.98423 8.9835 4.90511 9.21983 4.84192 9.44448H4.84105ZM5.07234 10.7223L5.12712 10.4132C5.12712 10.4132 5.14973 10.3056 5.19494 10.0906C5.43029 10.1469 5.6726 10.196 5.92186 10.2379C6.17112 10.2799 6.42705 10.3149 6.68964 10.3431C6.84383 10.5677 7.00006 10.7807 7.15831 10.982C7.31656 11.1832 7.47742 11.3729 7.64089 11.5508C7.30584 11.897 6.9731 12.1756 6.64269 12.3865C6.31227 12.5973 6.01113 12.7028 5.73926 12.7028C5.67608 12.7028 5.61956 12.698 5.5697 12.6884C5.51985 12.6788 5.46768 12.6599 5.41319 12.6318C5.22306 12.5191 5.09843 12.2945 5.0393 11.9578C4.98017 11.6212 4.99148 11.2093 5.07321 10.7223H5.07234Z"
                          fill="#69A7D3"
                        />
                        <path
                          id="Vector_2"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.03907 7.99866C9.03907 8.28861 8.93705 8.53901 8.733 8.74988C8.52896 8.96075 8.28201 9.06618 7.99217 9.06618C7.71161 9.06618 7.46931 8.96075 7.26526 8.74988C7.06121 8.53901 6.95919 8.28861 6.95919 7.99866C6.95919 7.69913 7.06121 7.44393 7.26526 7.23307C7.46931 7.0222 7.71161 6.91676 7.99217 6.91676C8.28201 6.91676 8.52896 7.0222 8.733 7.23307C8.93705 7.44393 9.03907 7.69913 9.03907 7.99866Z"
                          fill="#3965BD"
                        />
                      </g>
                    </svg>
                  )}

                  <span>{pg.name}</span>
                </div>

                <p>{diffDays} days ago</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}