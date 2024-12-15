import { FaFileAlt } from "react-icons/fa";

interface FileCard {
  name: string;
}

const Topfilesitem = ({ name }: FileCard) => {
  return (
    <div className="box-border flex h-auto items-center overflow-hidden rounded-large p-6 text-foreground shadow-medium shadow-dark-4 outline-none transition-transform-background data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus motion-reduce:transition-none dark:bg-gray-800">
      <FaFileAlt color="white" size={36} />
      <div className="flex flex-1 flex-col items-start px-4 pb-0 pt-2">
        <h4 className="text-large font-bold dark:text-white">
          {name}
        </h4>
        <small className="-z text-default-500">
          12 Tracks
        </small>
      </div>
      <div className="overflow-visible py-2">
        <span>COMP</span>
      </div>
    </div>
  );
};

export default Topfilesitem;
