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
  return (
    <>
      <h1 className="text-xl font-bold text-dark dark:text-white">
        Últimos Archivos
      </h1>
      <div className="m-4 grid grid-cols-6 justify-between gap-6">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <TopCardItem name={group.name} />
          </div>
        ))}
      </div>
    </>
  );
};

export default Topfiles;
