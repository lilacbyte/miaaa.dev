"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, SiteInfo, SocialLink } from "@/lib/data";

type RetroLandingProps = {
  projects: Project[];
  links: SocialLink[];
  site: SiteInfo;
  musicFiles: string[];
  photoFiles: string[];
};

function normalizeIndex(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function toTrackLabel(filePath: string): string {
  const filename = filePath.split("/").pop() ?? filePath;
  return filename.replace(/\.[^.]+$/, ".mp3");
}

function formatPeriod(period: string): string {
  return period.replace(/\bpresent\b/gi, "present");
}

export function RetroLanding({ projects, links, site, musicFiles, photoFiles }: RetroLandingProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const glitterLayerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [headerText, setHeaderText] = useState("");
  const currentTrack = musicFiles[trackIndex] ?? "";

  const trackLabel = useMemo(() => {
    if (!currentTrack) {
      return "no tracks";
    }
    return toTrackLabel(currentTrack);
  }, [currentTrack]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [projects]);

  const experiencedItems = site.experienced.length > 0 ? site.experienced : site.ecperienced ?? [];

  const tryPlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (musicFiles.length === 0) {
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
      return;
    }
    void tryPlay();
  };

  const cyclePhoto = (direction: number) => {
    if (photoFiles.length > 0) {
      setPhotoIndex((index) => normalizeIndex(index + direction, photoFiles.length));
    }
  };

  const onEnter = () => {
    if (musicFiles.length > 0) {
      setTrackIndex(Math.floor(Math.random() * musicFiles.length));
    }
    if (photoFiles.length > 0) {
      setPhotoIndex(Math.floor(Math.random() * photoFiles.length));
    }
    setEntered(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!currentTrack) {
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    if (audio.getAttribute("src") !== currentTrack) {
      audio.src = currentTrack;
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!entered) {
      return;
    }
    void tryPlay();
  }, [entered]);

  useEffect(() => {
    if (!entered || photoFiles.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setPhotoIndex((index) => normalizeIndex(index + 1, photoFiles.length));
    }, 20000);

    return () => window.clearInterval(timer);
  }, [entered, photoFiles]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!entered || event.code !== "Space") {
        return;
      }
      event.preventDefault();
      togglePlay();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [entered, isPlaying]);

  useEffect(() => {
    if (!entered) {
      setHeaderText("");
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setHeaderText(site.header.slice(0, index));
      if (index >= site.header.length) {
        window.clearInterval(timer);
      }
    }, 85);

    return () => window.clearInterval(timer);
  }, [entered, site.header]);

  useEffect(() => {
    if (!entered || site.refreshSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      router.refresh();
    }, site.refreshSeconds * 1000);

    return () => window.clearInterval(timer);
  }, [entered, site.refreshSeconds, router]);

  useEffect(() => {
    if (!entered || !glitterLayerRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const layer = glitterLayerRef.current;
    let lastParticle = 0;

    const spawnParticle = (x: number, y: number) => {
      const particle = document.createElement("span");
      particle.className = "glitter-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      const size = 4 + Math.random() * 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      layer.appendChild(particle);
      particle.addEventListener("animationend", () => {
        particle.remove();
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastParticle < 28) {
        return;
      }
      lastParticle = now;
      spawnParticle(event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [entered]);

  return (
    <>
      <div ref={glitterLayerRef} className="glitter-layer" aria-hidden="true" />
      <audio ref={audioRef} preload="auto" loop />

      {!entered ? (
        <div className="enter-wrap">
          <button className="enter" type="button" onClick={onEnter}>
            •─⋅☾ <span className="click">click to enter</span> ☽⋅─•
          </button>
        </div>
      ) : null}

      <section className={`layout ${entered ? "fade-in" : ""}`} style={{ display: entered ? "block" : "none" }}>
        <div className="row">
          <div className="col-lg-2" />
          <div className="col-lg-8">
            <div className="container">
              {photoFiles.length > 0 ? (
                <div className="media-carousel media-carousel--status">
                  <button className="media-button media-button--arrow" type="button" onClick={() => cyclePhoto(-1)}>
                    &lt;
                  </button>
                  <img className="mmm loaded" src={photoFiles[photoIndex]} alt="bookgirl style visual" />
                  <button className="media-button media-button--arrow" type="button" onClick={() => cyclePhoto(1)}>
                    &gt;
                  </button>
                </div>
              ) : null}

              <h3 className="header">{headerText}</h3>
              <p className="tagline">{site.description}</p>

              <div className="section-spacer" aria-hidden="true" />
              <details className="hov">
                <summary>about me</summary>
                <blockquote>
                  <div className="about-grid">
                    <p className="exp-box">{site.about}</p>
                  </div>
                </blockquote>
              </details>

              {experiencedItems.length > 0 ? (
                <details className="hov">
                  <summary>experienced with using</summary>
                  <blockquote>
                    <div className="info-grid">
                      {experiencedItems.map((item) => (
                        <span key={item.name} className="exp-box exp-box--static info-pill">
                          {item.icon ? <i className={item.icon} aria-hidden="true" /> : null}
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </blockquote>
                </details>
              ) : null}

              {site.interests.length > 0 ? (
                <details className="hov">
                  <summary>my interests</summary>
                  <blockquote>
                    <div className="info-grid">
                      {site.interests.map((item) => (
                        <span key={item.name} className="exp-box exp-box--static info-pill">
                          {item.icon ? <i className={item.icon} aria-hidden="true" /> : null}
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </blockquote>
                </details>
              ) : null}

              <details className="hov" open>
                <summary>projects</summary>
                <blockquote>
                  <div className="projects-grid">
                    {orderedProjects.map((project) => (
                      <article key={`${project.name}-${project.url}`} className="project-card">
                        <div className="project-card__header">
                          <span className="project-title-wrap">
                            <a className="project-link" href={project.url} target="_blank" rel="noreferrer">
                              {project.name}
                            </a>
                            {project.featured ? <i className="fa-solid fa-thumbtack project-pin" aria-hidden="true" /> : null}
                          </span>
                          <span className="badge">{formatPeriod(project.period)}</span>
                        </div>
                        <p>{project.description}</p>
                      </article>
                    ))}
                  </div>
                </blockquote>
              </details>

              <details className="hov">
                <summary>links</summary>
                <blockquote>
                  <div className="links-grid">
                    {links.map((link) => (
                      link.url && link.label.toLowerCase() !== "blink" ? (
                        <a
                          key={`${link.label}-${link.url}`}
                          className="exp-box"
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <strong>{link.label}</strong> {link.handle ? <span>{link.handle}</span> : null}
                        </a>
                      ) : (
                        <div key={`${link.label}-${link.handle ?? "nolink"}`} className="exp-box exp-box--static">
                          <strong>{link.label}</strong> {link.handle ? <span>{link.handle}</span> : null}
                        </div>
                      )
                    ))}
                  </div>
                </blockquote>
              </details>
            </div>
          </div>
          <div className="col-lg-2" />
        </div>
      </section>

      {entered ? (
        <aside className="player-dock" aria-label="music player">
          <div className="media-carousel media-carousel--pause">
            <div className="now-playing">
              {isPlaying ? "playing" : "paused"}: {trackLabel}
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
