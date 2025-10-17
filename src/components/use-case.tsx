import MuxPlayer from "@mux/mux-player-react"
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
          <MuxPlayer
              playbackId="izqC01vjPYbfgoun8MbI01bGSIUsxf2A00GVld00Tq8eBz4"
              style={{height: '100%', width: '90%'}}
              metadata={{
              video_id: "video-id-54321",
              video_title: "Indiegrowth Demo",
              viewer_user_id: "user-id-007",
              }}
              autoPlay={true}
              loop={true}
              muted={true}
              className='rounded-2xl overflow-hidden shadow-lg'
              
            />
          </div>
        </div>
      </section>
    )
}