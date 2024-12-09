import { Card, CardBody, CardHeader, Image } from "@nextui-org/react"

interface FileCard {
    name: string
}

const Topfilesitem = ({name}: FileCard)  => {
    return(
    <Card>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">{name}</p>
        <small className="text-default-500 -z">12 Tracks</small>
        <h4 className="font-bold text-large">Frontend Radio</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <span>HOLA</span>
      </CardBody>
    </Card>
    )
}

export default Topfilesitem