import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: torrentData, error: torrentError } = useSWR(formatProxyUrl(config, "torrents/info"));

  if (torrentError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!torrentData) {
    return (
      <Container>
        <Block label={t("qbittorrent.leech")} />
        <Block label={t("qbittorrent.download")} />
        <Block label={t("qbittorrent.seed")} />
        <Block label={t("qbittorrent.upload")} />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
  }

  const leech = torrentData.length - completed;

  let unitsDl = "KB/s";
  let unitsUl = "KB/s";
  rateDl /= 1024;
  rateUl /= 1024;

  if (rateDl > 1024) {
    rateDl /= 1024;
    unitsDl = "MB/s";
  }

  if (rateUl > 1024) {
    rateUl /= 1024;
    unitsUl = "MB/s";
  }

  return (
    <Container>
      <Block label={t("qbittorrent.leech")} value={t("common.number", { value: leech })} />
      <Block label={t("qbittorrent.download")} value={`${rateDl.toFixed(2)} ${unitsDl}`} />
      <Block label={t("qbittorrent.seed")} value={t("common.number", { value: completed })} />
      <Block label={t("qbittorrent.upload")} value={`${rateUl.toFixed(2)} ${unitsUl}`} />
    </Container>
  );
}