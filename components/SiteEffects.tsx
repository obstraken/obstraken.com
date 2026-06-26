"use client";

import { useEffect } from "react";

type DotRunner = {
  el: SVGCircleElement;
  key: string;
  dur: number;
  begin: number;
};

function setStatus(element: HTMLElement | null, message: string, tone: "ok" | "error") {
  if (!element) {
    return;
  }

  element.style.display = "block";
  element.textContent = message;
  element.dataset.tone = tone;
}

export function SiteEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const nav = document.querySelector<HTMLElement>("nav.top, nav");
    const navHeight = () => {
      if (!nav) {
        return 0;
      }

      const height = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${height}px`);
      return height;
    };

    const targetFromHash = (hash: string) => {
      if (!hash || hash.length < 2) {
        return null;
      }

      return document.getElementById(decodeURIComponent(hash.slice(1)));
    };

    const scrollToHash = (hash: string, animate: boolean, updateUrl: boolean) => {
      const target = targetFromHash(hash);
      if (!target) {
        return false;
      }

      const y = target.getBoundingClientRect().top + window.pageYOffset - navHeight();
      window.scrollTo({ top: Math.max(0, y), behavior: animate ? "smooth" : "auto" });

      if (updateUrl && window.history?.pushState) {
        window.history.pushState(null, "", hash);
      }

      return true;
    };

    navHeight();
    window.addEventListener("resize", navHeight);
    cleanups.push(() => window.removeEventListener("resize", navHeight));

    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      const onClick = (event: MouseEvent) => {
        const hash = link.getAttribute("href");
        if (hash && scrollToHash(hash, true, true)) {
          event.preventDefault();
        }
      };

      link.addEventListener("click", onClick);
      cleanups.push(() => link.removeEventListener("click", onClick));
    });

    const onHashLoad = () => {
      if (window.location.hash) {
        requestAnimationFrame(() => scrollToHash(window.location.hash, false, false));
      }
    };
    const onHashChange = () => {
      if (window.location.hash) {
        scrollToHash(window.location.hash, false, false);
      }
    };
    window.addEventListener("load", onHashLoad);
    window.addEventListener("hashchange", onHashChange);
    cleanups.push(() => {
      window.removeEventListener("load", onHashLoad);
      window.removeEventListener("hashchange", onHashChange);
    });
    onHashLoad();

    const flow = document.querySelector<HTMLElement>(".data-flow");
    let animationFrame = 0;
    let activeSourceInterval: number | undefined;
    let resizeObserver: ResizeObserver | undefined;

    if (flow) {
      const svg = flow.querySelector<SVGSVGElement>(".df-svg");
      const hub = flow.querySelector<HTMLElement>(".df-hub");
      const nodes = Array.from(flow.querySelectorAll<HTMLElement>(".df-node"));
      const outs = Array.from(flow.querySelectorAll<HTMLElement>("[data-df-out]"));

      if (svg && hub && nodes.length && outs.length) {
        let dotsBooted = false;
        const dotRunners: DotRunner[] = [];
        let dotStartedAt = 0;
        const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dotMotion: Record<string, { dur: number; begin: number }> = {
          "in-0": { dur: 2.6, begin: 0 },
          "in-1": { dur: 2.8, begin: 0.4 },
          "in-2": { dur: 2.7, begin: 0.8 },
          "out-0": { dur: 2.4, begin: 0 },
          "out-1": { dur: 2.6, begin: 0.5 },
        };

        const animateDots = (now: number) => {
          if (svg.classList.contains("is-ready") && motionOk) {
            const time = (now - dotStartedAt) / 1000;

            dotRunners.forEach((runner) => {
              const path = svg.querySelector<SVGPathElement>(`[data-df-line="${runner.key}"]`);
              if (!path) {
                return;
              }

              const length = path.getTotalLength();
              if (!length) {
                return;
              }

              const elapsed = time - runner.begin;
              if (elapsed < 0) {
                runner.el.setAttribute("cx", "-9999");
                runner.el.setAttribute("cy", "-9999");
                return;
              }

              const point = path.getPointAtLength(((elapsed % runner.dur) / runner.dur) * length);
              runner.el.setAttribute("cx", String(point.x));
              runner.el.setAttribute("cy", String(point.y));
            });
          }

          animationFrame = requestAnimationFrame(animateDots);
        };

        const bootDots = () => {
          if (dotsBooted) {
            return;
          }

          dotsBooted = true;
          svg.querySelectorAll<SVGCircleElement>("[data-df-dot]").forEach((dot) => {
            const key = dot.getAttribute("data-df-dot");
            const config = key ? dotMotion[key] : undefined;
            if (key && config) {
              dotRunners.push({ el: dot, key, dur: config.dur, begin: config.begin });
            }
          });

          if (motionOk) {
            dotStartedAt = performance.now();
            animationFrame = requestAnimationFrame(animateDots);
          }
        };

        const showFlow = () => {
          bootDots();
          svg.classList.add("is-ready");
        };

        const curve = (x1: number, y1: number, x2: number, y2: number) => {
          const mx = x1 + (x2 - x1) * 0.55;
          return `M${x1},${y1} C${mx},${y1} ${x2 - 28},${y2} ${x2},${y2}`;
        };

        const curveSide = (x1: number, y1: number, x2: number, y2: number, gutterX: number) =>
          `M${x1},${y1} C${gutterX},${y1} ${gutterX},${y2} ${x2},${y2}`;

        const setPath = (key: string, d: string) => {
          const path = svg.querySelector<SVGPathElement>(`[data-df-line="${key}"]`);
          if (path) {
            path.setAttribute("d", d);
          }
        };

        const layout = () => {
          const width = flow.offsetWidth;
          const height = flow.offsetHeight;
          if (width < 1 || height < 1) {
            return;
          }

          svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
          const flowRect = flow.getBoundingClientRect();
          const hubRect = hub.getBoundingClientRect();
          const mobile = window.matchMedia("(max-width:820px)").matches;

          if (mobile) {
            const hubTopY = hubRect.top - flowRect.top;
            const hubBottomY = hubRect.top - flowRect.top + hubRect.height;
            const hubLeft = hubRect.left - flowRect.left;
            const inGutter = Math.max(
              ...nodes.map((node) => node.getBoundingClientRect().right - flowRect.left),
            ) + 22;

            nodes.forEach((node, index) => {
              const nodeRect = node.getBoundingClientRect();
              const x1 = nodeRect.right - flowRect.left;
              const y1 = nodeRect.top - flowRect.top + nodeRect.height / 2;
              const x2 = hubLeft + hubRect.width * (0.22 + index * 0.28);
              setPath(`in-${index}`, curveSide(x1, y1, x2, hubTopY, inGutter));
            });

            const outGutter = Math.min(
              ...outs.map((out) => out.getBoundingClientRect().left - flowRect.left),
            ) - 22;

            outs.forEach((out, index) => {
              const outRect = out.getBoundingClientRect();
              const x1 = hubLeft + hubRect.width * (0.28 + index * 0.24);
              const x2 = outRect.left - flowRect.left;
              const y2 = outRect.top - flowRect.top + outRect.height / 2;
              setPath(`out-${index}`, curveSide(x1, hubBottomY, x2, y2, outGutter));
            });
          } else {
            const hubLeft = hubRect.left - flowRect.left;
            const hubRight = hubLeft + hubRect.width;

            nodes.forEach((node, index) => {
              const nodeRect = node.getBoundingClientRect();
              const x1 = nodeRect.right - flowRect.left;
              const y1 = nodeRect.top - flowRect.top + nodeRect.height / 2;
              setPath(`in-${index}`, curve(x1, y1, hubLeft, y1));
            });

            outs.forEach((out, index) => {
              const outRect = out.getBoundingClientRect();
              const x2 = outRect.left - flowRect.left;
              const y2 = outRect.top - flowRect.top + outRect.height / 2;
              setPath(`out-${index}`, curve(hubRight, y2, x2, y2));
            });
          }

          if (!svg.classList.contains("is-ready")) {
            showFlow();
          }
        };

        let idx = 0;
        const tick = () => {
          nodes.forEach((node, index) => node.classList.toggle("is-active", index === idx));
          idx = (idx + 1) % nodes.length;
        };

        tick();
        layout();
        window.addEventListener("resize", layout);
        window.addEventListener("load", layout);
        cleanups.push(() => {
          window.removeEventListener("resize", layout);
          window.removeEventListener("load", layout);
        });

        if (motionOk) {
          activeSourceInterval = window.setInterval(tick, 3200);
        }

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(layout);
          resizeObserver.observe(flow);
        }
      }
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    cleanups.push(() => revealObserver.disconnect());

    const fxItems = Array.from(document.querySelectorAll<HTMLElement>(".fx-item"));
    const fxCards = Array.from(document.querySelectorAll<HTMLElement>(".fx-card"));
    const selectFx = (index: string) => {
      fxItems.forEach((item) => {
        const on = item.getAttribute("data-fx") === index;
        item.classList.toggle("on", on);
        item.setAttribute("aria-selected", on ? "true" : "false");
      });
      fxCards.forEach((card) => card.classList.toggle("on", card.getAttribute("data-fx") === index));
    };

    fxItems.forEach((item) => {
      const index = item.getAttribute("data-fx") ?? "0";
      const onClick = () => selectFx(index);
      const onMouseEnter = () => selectFx(index);
      item.addEventListener("click", onClick);
      item.addEventListener("mouseenter", onMouseEnter);
      cleanups.push(() => {
        item.removeEventListener("click", onClick);
        item.removeEventListener("mouseenter", onMouseEnter);
      });
    });

    document.querySelectorAll<HTMLButtonElement>(".svc-trigger").forEach((button) => {
      const onClick = () => {
        const card = button.closest(".svc");
        if (!card) {
          return;
        }

        const open = card.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      };

      button.addEventListener("click", onClick);
      cleanups.push(() => button.removeEventListener("click", onClick));
    });

    const form = document.getElementById("cform") as HTMLFormElement | null;
    if (form) {
      const status = document.getElementById("ok");
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const initialSubmitText = submit?.textContent ?? "";

      const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (submit) {
          submit.disabled = true;
          submit.textContent = "Envoi en cours...";
        }
        setStatus(status, "Envoi de votre demande en cours.", "ok");

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = (await response.json().catch(() => ({}))) as { error?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Impossible d'envoyer la demande.");
          }

          form.reset();
          setStatus(status, "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.", "ok");
        } catch (error) {
          setStatus(
            status,
            error instanceof Error ? error.message : "Impossible d'envoyer la demande pour le moment.",
            "error",
          );
        } finally {
          if (submit) {
            submit.disabled = false;
            submit.textContent = initialSubmitText;
          }
        }
      };

      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (activeSourceInterval) {
        window.clearInterval(activeSourceInterval);
      }
      resizeObserver?.disconnect();
    };
  }, []);

  return null;
}
