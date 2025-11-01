
export default function UseCase(){
    return(
        <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-normal text-foreground mb-4">
              Just Give Us The Url Of Your App And We Will Handle The Rest
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Our AI Handles Content, Marketing, Growth and More For Your App , just ask
            </p>
          </div>

          <div className="flex justify-center items-center">
            <iframe
              src="https://player.mux.com/izqC01vjPYbfgoun8MbI01bGSIUsxf2A00GVld00Tq8eBz4"
              style={{width: '80%', border: 'none', aspectRatio: '16/9'}}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="rounded-2xl overflow-hidden shadow-lg"
            />
          </div>
        </div>
      </section>
    )
}