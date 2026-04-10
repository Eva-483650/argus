<template>
  <main class="team-view" :class="`theme-${themeMode}`">
    <section class="team-shell">
      <header class="team-hero">
        <p class="team-hero__eyebrow">Research Group</p>
        <h1 class="team-hero__title">Our Team</h1>
        <div class="team-hero__divider"></div>
      </header>

      <div class="team-grid">
        <article
          v-for="(member, index) in members"
          :key="member.id"
          class="team-card"
          :class="{ 'team-card--featured': index === members.length - 1 && members.length % 2 === 1 }"
        >
          <div class="team-card__media">
            <img
              v-if="member.photo"
              class="team-card__photo"
              :src="member.photo"
              :alt="member.name"
            />

            <div v-else class="team-card__photo team-card__photo--placeholder">
              <span>Photo Slot</span>
              <small>Replace with portrait</small>
            </div>

            <p class="team-card__media-caption">{{ member.imageHint }}</p>
          </div>

          <div class="team-card__content">
            <span class="team-card__index">{{ member.index }}</span>
            <h2 class="team-card__name">{{ member.name }}</h2>
            <p class="team-card__role">{{ member.role }}</p>
            <div class="team-card__line"></div>
            <p class="team-card__bio">{{ member.bio }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, ref } from 'vue'

const injectedTheme = inject('argusTheme', ref(true))
const themeMode = computed(() => (injectedTheme.value ? 'dark' : 'light'))

const members = [
  {
    id: 'member-01',
    index: '01',
    name: 'Member One',
    role: 'Principal Investigator / Team Lead',
    photo: '',
    imageHint: 'Reserved area for a headshot, lab portrait, or formal profile image.',
    bio:
      'Use this paragraph for a concise biography. Introduce academic background, research interests, and the member\'s role in the Argus project.',
    focus: 'Multimodal perception, detection pipeline design, and project direction.',
    note: 'Reserved for publications, awards, contact details, or a short personal statement.',
  },
  {
    id: 'member-02',
    index: '02',
    name: 'Member Two',
    role: 'Core Researcher / Algorithm Engineer',
    photo: '',
    imageHint: 'Reserved area for a team portrait, office photo, or personal profile picture.',
    bio:
      'Replace this text with the second member introduction. This area is intended for expertise, responsibilities, and technical strengths.',
    focus: 'Sensor fusion, model training, deployment experiments, and evaluation.',
    note: 'Reserved for project milestones, technical specialties, or collaboration links.',
  },
  {
    id: 'member-03',
    index: '03',
    name: 'Member Three',
    role: 'Research Assistant / System Support',
    photo: '',
    imageHint: 'Reserved area for an image with the same aspect ratio as the other members.',
    bio:
      'Use this block for the third member profile. You can place educational background, responsibilities, and a brief introduction here.',
    focus: 'Dataset curation, experiment support, visualization, and documentation.',
    note: 'Reserved for future expansion such as email, social links, or project tasks.',
  },
]
</script>

<style scoped>
.team-view {
  min-height: calc(100vh - 56px);
  padding: 40px 24px 72px;
}

.team-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 34px 48px;
  border-radius: 28px;
  border: 1px solid var(--team-shell-border);
  background:
    linear-gradient(180deg, var(--team-shell-top), var(--team-shell-bottom)),
    var(--team-shell-bg);
  box-shadow: 0 24px 80px var(--team-shell-shadow);
  backdrop-filter: blur(18px);
}

.team-hero {
  text-align: center;
  margin-bottom: 34px;
}

.team-hero__eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--team-eyebrow);
}

.team-hero__title {
  margin: 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: 0.02em;
  color: var(--team-title);
}

.team-hero__divider {
  width: 100%;
  height: 1px;
  margin: 24px 0 18px;
  background: linear-gradient(90deg, transparent, var(--team-divider), transparent);
}

.team-hero__intro {
  max-width: 880px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.8;
  color: var(--team-copy);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.team-card {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 24px;
  padding: 28px 8px 0;
  border-top: 1px solid var(--team-card-line);
}

.team-card--featured {
  grid-column: 1 / -1;
  max-width: 760px;
  justify-self: center;
}

.team-card__media {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.team-card__photo {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--team-photo-border);
  box-shadow: 0 18px 34px var(--team-photo-shadow);
}

.team-card__photo--placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background:
    radial-gradient(circle at top, var(--team-photo-glow), transparent 70%),
    linear-gradient(180deg, var(--team-photo-top), var(--team-photo-bottom));
  color: var(--team-photo-text);
  text-align: center;
}

.team-card__photo--placeholder span {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.team-card__photo--placeholder small {
  width: 86px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--team-photo-subtext);
}

.team-card__media-caption {
  margin: 0;
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
  color: var(--team-muted);
}

.team-card__content {
  min-width: 0;
}

.team-card__index {
  display: inline-flex;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--team-accent);
}

.team-card__name {
  margin: 0;
  font-size: 32px;
  line-height: 1.08;
  font-weight: 700;
  color: var(--team-name);
}

.team-card__role {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--team-role);
}

.team-card__line {
  width: 96px;
  height: 2px;
  margin: 18px 0 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--team-accent), transparent);
}

.team-card__bio {
  margin: 0;
  font-size: 15px;
  line-height: 1.82;
  color: var(--team-copy);
}

.team-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.team-card__detail {
  padding: 14px 16px;
  border: 1px solid var(--team-detail-border);
  border-radius: 16px;
  background: var(--team-detail-bg);
}

.team-card__detail-label {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--team-muted);
}

.team-card__detail p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--team-copy);
}

.theme-dark {
  --team-shell-bg: rgba(8, 15, 26, 0.5);
  --team-shell-top: rgba(255, 255, 255, 0.03);
  --team-shell-bottom: rgba(255, 255, 255, 0.01);
  --team-shell-border: rgba(255, 255, 255, 0.08);
  --team-shell-shadow: rgba(0, 0, 0, 0.24);
  --team-title: #f8f3e7;
  --team-name: #f4efe4;
  --team-eyebrow: rgba(212, 176, 106, 0.78);
  --team-copy: rgba(222, 230, 239, 0.82);
  --team-role: rgba(189, 201, 216, 0.84);
  --team-muted: rgba(164, 176, 191, 0.78);
  --team-divider: rgba(212, 176, 106, 0.32);
  --team-card-line: rgba(255, 255, 255, 0.08);
  --team-accent: #d4b06a;
  --team-photo-border: rgba(255, 255, 255, 0.08);
  --team-photo-shadow: rgba(0, 0, 0, 0.28);
  --team-photo-top: rgba(37, 51, 70, 0.92);
  --team-photo-bottom: rgba(14, 22, 35, 0.92);
  --team-photo-glow: rgba(212, 176, 106, 0.18);
  --team-photo-text: #edf3fb;
  --team-photo-subtext: rgba(212, 220, 232, 0.7);
  --team-detail-border: rgba(255, 255, 255, 0.08);
  --team-detail-bg: rgba(255, 255, 255, 0.03);
}

.theme-light {
  --team-shell-bg: rgba(255, 255, 255, 0.72);
  --team-shell-top: rgba(255, 255, 255, 0.72);
  --team-shell-bottom: rgba(248, 250, 252, 0.52);
  --team-shell-border: rgba(148, 163, 184, 0.18);
  --team-shell-shadow: rgba(15, 23, 42, 0.08);
  --team-title: #4f78d4;
  --team-name: #1f2f49;
  --team-eyebrow: rgba(78, 110, 189, 0.82);
  --team-copy: rgba(60, 73, 92, 0.9);
  --team-role: rgba(88, 103, 126, 0.88);
  --team-muted: rgba(101, 119, 146, 0.82);
  --team-divider: rgba(148, 163, 184, 0.32);
  --team-card-line: rgba(148, 163, 184, 0.24);
  --team-accent: #c59b4f;
  --team-photo-border: rgba(148, 163, 184, 0.18);
  --team-photo-shadow: rgba(15, 23, 42, 0.1);
  --team-photo-top: rgba(248, 250, 252, 0.98);
  --team-photo-bottom: rgba(231, 238, 247, 0.98);
  --team-photo-glow: rgba(79, 120, 212, 0.18);
  --team-photo-text: #29416c;
  --team-photo-subtext: rgba(70, 95, 138, 0.78);
  --team-detail-border: rgba(148, 163, 184, 0.16);
  --team-detail-bg: rgba(255, 255, 255, 0.56);
}

@media (max-width: 1080px) {
  .team-grid {
    grid-template-columns: 1fr;
  }

  .team-card--featured {
    grid-column: auto;
    max-width: none;
  }
}

@media (max-width: 720px) {
  .team-view {
    padding: 22px 16px 40px;
  }

  .team-shell {
    padding: 28px 20px 30px;
    border-radius: 22px;
  }

  .team-hero {
    margin-bottom: 28px;
  }

  .team-hero__intro {
    font-size: 15px;
  }

  .team-card {
    grid-template-columns: 1fr;
    padding: 22px 0 0;
  }

  .team-card__media {
    align-items: flex-start;
  }

  .team-card__media-caption {
    text-align: left;
  }

  .team-card__name {
    font-size: 26px;
  }

  .team-card__details {
    grid-template-columns: 1fr;
  }
}
</style>
