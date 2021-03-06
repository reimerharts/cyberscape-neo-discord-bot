package com.titaniumtemplar.discordbot.model.monster;

import com.titaniumtemplar.db.jooq.enums.SkillType;
import com.titaniumtemplar.db.jooq.enums.StatType;
import com.titaniumtemplar.discordbot.model.character.Skill;
import com.titaniumtemplar.discordbot.model.combat.Attack;
import com.titaniumtemplar.discordbot.model.combat.AttackType;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Monster {

	private String name;
	private int currentHp;
	private int maxHp;
	private int xp;
	private Map<SkillType, Skill> skills;
	private Map<StatType, AtomicInteger> stats;

	private final Map<AttackType, AtomicInteger> defenseCharge = new HashMap<>();
	private final Map<AttackType, Boolean> shields = new HashMap<>();

	public static Monster fromTemplate(MonsterTemplate template) {
		return Monster.builder()
			.name(template.getName())
			.maxHp(template.getHpMax())
			.currentHp(template.getHpMax())
			.xp(template.getXp())
			.skills(template.getSkills())
			.stats(template.getStats())
			.build();
	}

	public boolean isDead() {
		return currentHp <= 0;
	}

	public void applyAttack(Attack attack) {
		currentHp -= Math.max(attack.getDamage(), 0);
		defenseCharge.computeIfAbsent(attack.getAttackType(), (__) -> new AtomicInteger())
			.addAndGet(20);
	}

	public void handleShields() {
		defenseCharge.forEach((type, charge) -> {
			if (charge.get() >= 100) {
				shields.put(type, true);
				charge.addAndGet(-100);
			} else {
				shields.put(type, false);
			}
		});
	}

	public int getDefenseCharge(AttackType attackType) {
		return defenseCharge.computeIfAbsent(attackType, (__) -> new AtomicInteger())
			.get();
	}

	public boolean hasShield(AttackType attackType) {
		return shields.getOrDefault(attackType, false);
	}
}
