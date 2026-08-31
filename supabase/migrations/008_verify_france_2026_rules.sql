update public.finance_rule_sets set
 source_url='https://mon-entreprise.urssaf.fr/documentation/dirigeant/auto%E2%80%91entrepreneur/cotisations-et-contributions/cotisations/service-BIC/taux',
 source_label='URSSAF Mon-entreprise — Service BIC rate', verified_at=now(),
 rules=jsonb_set(jsonb_set(rules,'{social_rate}','21.2'::jsonb,true),'{recovery_fee_b2b}','40'::jsonb,true)
where country='FR' and code='micro_bic_service' and effective_from='2026-01-01';
update public.finance_rule_sets set
 source_url='https://www.urssaf.fr/accueil/actualites/taux-cotisations-autoentrepeneur.html',
 source_label='URSSAF — BNC rate from 1 Jan 2026', verified_at=now(),
 rules=jsonb_set(rules,'{social_rate}','25.6'::jsonb,true)
where country='FR' and code='micro_bnc_service' and effective_from='2026-01-01';
insert into public.finance_rule_sets(country,code,effective_from,rules,source_url,source_label,verified_at) values
('FR','b2b_recovery_fee','2026-01-01','{"fixed_recovery_fee":40}'::jsonb,'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043197457/','Code de commerce, article D441-5',now()),
('FR','e_invoicing_schedule','2026-09-01','{"receive_from":"2026-09-01","large_emit_from":"2026-09-01","sme_micro_emit_from":"2027-09-01"}'::jsonb,'https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises','Ministère de l’Économie — facturation électronique',now())
on conflict(country,code,effective_from) do update set rules=excluded.rules,source_url=excluded.source_url,source_label=excluded.source_label,verified_at=excluded.verified_at;
