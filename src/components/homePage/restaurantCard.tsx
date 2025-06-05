import Link from "next/link";

type RestaurantCardProps = {
	id: string;
	name: string;
	description: string;
	address: string;
	imageUrl: string;
};

export default function RestaurantCard({
	id,
	name,
	description,
	address,
	imageUrl,
}: RestaurantCardProps) {
	return (
		<div className="bg-(--color-gray) shadow-lg rounded-lg overflow-hidden">
			<img src={imageUrl} alt={name} className="w-full h-40 object-cover" />
			<div className="p-4 text-left">
				<h2 className="text-xl font-bold mb-1">{name}</h2>
				<p className="text-sm text-(--color-white) mb-2">{description}</p>
				<p className="text-xs text-(--color-ice-blue) italic mb-4">{address}</p>
				<div className="flex justify-center">
					<Link
						href={`/restaurant/${id}`}
						className="bg-(--color-ice-blue) text-(--color-black) px-6 py-2 rounded hover:bg-(--color-steel-blue) transition text-center w-full block"
					>
						Order Now
					</Link>
				</div>
			</div>
		</div>
	);
}
