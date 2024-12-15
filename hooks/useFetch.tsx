export const searchContent = async (
  search: string,
  index: string,
  page: number,
): Promise<[Error?, Data?, number?, number?]> => {
  try {
    const res = await fetch(
      `http://192.168.1.44:3000/api/search/?q=${search}&index=${index}&page=${page}`,
    );
    if (!res.ok) return [new Error("Error al buscar")];
    const json = await res.json();
    return [undefined, json.results, json.total_pages];
  } catch (error) {
    if (error instanceof Error) return [error];
  }
  return [new Error("Error desconocido")];
};
