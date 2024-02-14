import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
interface NavItemProps {
  icon: IconDefinition;
  iconColor: string;
  text: string;
}

const NavItem = ({ icon, iconColor, text }: NavItemProps) => {
  const navLink = text === "Home" ? "/" : "/library";
  return (
    <Link
      href={navLink}
      className="flex flex-row justify-center items-center mb-4"
    >
      <FontAwesomeIcon
        icon={icon}
        color={iconColor}
        className={`h-4 w-4 rounded-full mr-2`}
      />
      <p className="text-sm">{text}</p>
    </Link>
  );
};

export default NavItem;
