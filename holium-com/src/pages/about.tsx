import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';

import { Flex, Text } from '@holium/design-system/general';

import { HoliumLogoSection } from 'components/about/HoliumLogoSection';
import { HoliumMissionSection } from 'components/about/HoliumMissionSection';
import { HoliumRoadmapSection } from 'components/about/HoliumRoadmapSection';
import { HoliumValuesSection } from 'components/about/HoliumValuesSection';
import { Page, siteUrl } from 'components/Page';

import { Section, SectionTitle } from '../styles/about.styles';

export default function AboutPage() {
  useEffect(() => {
    track('About Page');
  }, []);

  return (
    <Page
      title="Our mission"
      description="Build a sovereign future for humanity."
      image={`${siteUrl}/og-image-mission.png`}
      forcedSpace="realm-forerunners"
      body={
        <Flex
          flex={1}
          width="100%"
          maxWidth="1000px"
          margin="100px auto"
          flexDirection="column"
          gap="64px"
          padding="0 16px"
        >
          <HoliumMissionSection />

          <Section>
            <SectionTitle>Our Values</SectionTitle>
            <Text.Body style={{ fontSize: 16, marginBottom: 16 }}>
              Whatever we do, these are the principles that guide our decisions.
            </Text.Body>
            <HoliumValuesSection />
          </Section>

          <Section>
            <SectionTitle>Our Logo</SectionTitle>
            <HoliumLogoSection />
          </Section>

          <Section>
            <SectionTitle>Roadmap</SectionTitle>
            <Flex
              flex={1}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <HoliumRoadmapSection />
            </Flex>
          </Section>
        </Flex>
      }
      wallpaper={false}
    />
  );
}
