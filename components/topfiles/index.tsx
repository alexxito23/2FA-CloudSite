import TopCardItem from "./TopCardItem";

const Topfiles = () => {
    const menuGroups = [
        {
            name: "ITEM1",
        },
        {
            name: "ITEM2",
        },
        {
            name: "ITEM2",
        },
        {
            name: "ITEM2",
        },
        {
            name: "ITEM2",
        },
        {
            name: "ITEM2",
        },
      ];
    return(
        <>
        <h1 className="text-xl font-bold text-dark dark:text-white">
          Últimos Archivos
        </h1>
        <div className="grid-cols-6 grid justify-between gap-6 m-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <TopCardItem name={group.name}/>
              </div>
            ))}
        </div>
        </>
    )
}

export default Topfiles