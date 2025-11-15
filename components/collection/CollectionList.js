import CollectionItem from "./CollectionItem";

export default function CollectionList({ collections }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
      {collections.map((collection, index) => (
        <CollectionItem
          key={collection.slug}
          collection={collection}
          index={index}
        />
      ))}
    </ul>
  );
}
