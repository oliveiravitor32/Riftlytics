import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import Image from "next/image";

import ProfileIcon from "../assets/profile-github-icon.png";
import { Button } from "./ui/button";
import { Calendar, ChartNoAxesCombined } from "lucide-react";

export default function ProfileCard() {
  return (
    <Card className="cursor-pointer flex-row justify-between items-center w-2xl px-2 py-6 ">
      <div className="flex">
        <Image
          priority
          src={ProfileIcon}
          width={60}
          height={60}
          alt="Foto de Perfil"
        />
        <div className="flex flex-col align-end">
          <CardHeader>
            <CardTitle>
              FlyerCloud <span className="text-muted-foreground">#Dev </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              <ul>
                <li>Elo atual Solo/Duo: Desafiante</li>
                <li>Elo atual Flex: Desafiante</li>
              </ul>
            </CardDescription>
          </CardContent>
        </div>
      </div>
      <CardFooter className="self-end flex gap-2">
        <CardAction>
          <Button className="w-auto">
            <ChartNoAxesCombined className="size-5" />
            Análise
          </Button>
        </CardAction>
        <CardAction>
          <Button className="w-auto">
            <Calendar className="size-5" />
            Histórico
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
