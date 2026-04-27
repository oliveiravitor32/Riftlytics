import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../../ui/navigation-menu";

export default function NavMenu() {
  const navItems = [
    "Início",
    "Campeões",
    "Top jogadores",
    "Dados estatísticos",
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-4">
        {navItems.map((item) => (
          <NavigationMenuItem key={item}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/">{item}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
