import EntryForm from "@/components/EntryForm";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center space-y-8">
        <h1 className="text-3xl md:text-5xl font-semibold">Scenic Seat Finder</h1>
        <p className="text-neutral-400">Choose source, destination, and time to reveal golden seats.</p>
        <EntryForm />
      </div>
    </div>
  );
}
