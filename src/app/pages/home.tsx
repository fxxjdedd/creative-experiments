import React from "react";
import { Link } from "react-router-dom";

const effects = [
  {
    id: "spotted",
    title: "spotted effect based on Reaction Diffusion",
    description: "将图片转换为动态流动的斑点效果",
    thumbnail: "/thumbnails/spotted.jpg",
  },
  {
    id: "spotted2",
    title: "spotted effect based on Reaction Diffusion",
    description: "将图片转换为动态流动的斑点效果2",
    thumbnail: "/thumbnails/spotted2.png",
  },
  {
    id: "gpugem-wave",
    title: "GPU Gem Wave",
    description: "GPU Gem Wave",
    thumbnail: "/thumbnails/gpugem-wave.png",
  },
  {
    id: "meteor",
    title: "Meteor Effect",
    description: "流星效果",
    thumbnail: "/thumbnails/meteor.png",
  },
  // {
  //   id: "smoke",
  //   title: "Smoke Effect",
  //   description: "烟雾效果",
  //   thumbnail: "/thumbnails/smoke.png",
  // },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="fixed top-0 left-0 w-full bg-zinc-900/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-medium text-white">VFX Effects Gallery</h1>
          <p className="mt-2 text-zinc-400">A collection of WebGL and Three.js visual effects experiments</p>
        </div>
      </header>

      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {effects.map((effect) => (
              <Link key={effect.id} to={`/effect/${effect.id}`} className="group block">
                <div className="bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-700/80 transition-colors">
                  <div className="aspect-video bg-black relative">
                    <img
                      src={effect.thumbnail}
                      alt={effect.title}
                      className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-white">{effect.title}</h2>
                    <p className="mt-2 text-zinc-400">{effect.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
