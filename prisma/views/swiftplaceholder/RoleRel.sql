SELECT
  `swiftplaceholder`.`casbin_rule`.`v0` AS `sub`,
  `swiftplaceholder`.`casbin_rule`.`v1` AS `psub`
FROM
  `swiftplaceholder`.`casbin_rule`
WHERE
  (`swiftplaceholder`.`casbin_rule`.`ptype` = 'g')