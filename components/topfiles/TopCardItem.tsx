interface FileCard {
    name: string
}

const Topfilesitem = ({name}: FileCard)  => {
    return(
    <div className="flex flex-col shadow-dark-4 overflow-hidden h-auto text-foreground box-border dark:bg-gray-800 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 shadow-medium rounded-large transition-transform-background motion-reduce:transition-none">
      <div className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold dark:text-white">{name}</p>
        <small className="text-default-500 -z">12 Tracks</small>
        <h4 className="font-bold text-large dark:text-white">{name}</h4>
      </div>
      <h2 className="overflow-visible py-2">
        <span>HOLA</span>
      </h2>
    </div>
    )
}

export default Topfilesitem