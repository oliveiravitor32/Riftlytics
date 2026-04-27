import Logo from "../../logo";
import { Field } from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import ThemeToggle from "../../theme-toggle";
import NavMenu from "./nav-menu";

export default function Header() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <section className="flex justify-between items-center py-2 max-w-7xl mx-auto">
        <div className="flex-1">
          <Logo />
        </div>
        <Field className="flex flex-1 flex-row w-auto gap-0">
          <Select defaultValue="BR">
            <SelectTrigger className="w-full max-w-48 rounded-tr-none rounded-br-none">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectItem value="BR">BR</SelectItem>
                <SelectItem value="20">NA</SelectItem>
                <SelectItem value="banana">KR</SelectItem>
                <SelectItem value="blueberry">EUW</SelectItem>
                <SelectItem value="grapes">SEA</SelectItem>
                <SelectItem value="pineapple">JP</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <InputGroup className="rounded-tl-none rounded-bl-none">
            <InputGroupInput
              className="w-md"
              id="inline-start-input"
              placeholder="Invocador + #BR1"
            />
            <InputGroupAddon align="inline-end">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <div className="flex justify-end flex-1">
          <ThemeToggle />
        </div>
      </section>
      <section className="flex justify-center mb-1">
        <NavMenu />
      </section>
    </header>
  );
}
