# Multicolor soliton

[English](./multicolor-soliton.en.md)

## 仿真的方程

该模型参考 *Multicolor interband solitons in microcombs* 的 supplementary
equations S1-S3，使用 primary、signal 和 idler 三个场：
$E_p(\phi,t)$、 $E_s(\phi,t)$、 $E_i(\phi,t)$。浏览器中使用损耗归一化形式。

物理量层面，这是三个模式族的 coupled LLE。每个模式族都有自己的损耗
$\kappa_j$、失谐 $\delta_j$、二阶色散 $D_{2j}$ 和腔内慢变场 $A_j$；primary
模式族由外部泵浦驱动，signal 和 idler 通过 Kerr 四波混频从噪声或弱种子增长。
三场之间的耦合包含 self-phase modulation (SPM)、cross-phase modulation (XPM)
和相干 four-wave mixing (FWM)。页面使用 $t=\kappa_pT/2$ 的损耗半宽归一化，
并把场缩放为无量纲幅度。

归一化模型保留 self-phase modulation、cross-phase modulation、four-wave mixing、
FSR mismatch 和 primary pump：

$$
\frac{\partial E_p}{\partial t}
=-(1+i\alpha_p)E_p
+i\frac{d_{2p}}{2}\frac{\partial^2 E_p}{\partial\phi^2}
+i\left(|E_p|^2+2\eta |E_s|^2+2\eta |E_i|^2\right)E_p
+2i\gamma E_sE_iE_p^*
+F ,
$$

$$
\frac{\partial E_s}{\partial t}
=-\Delta_s\frac{\partial E_s}{\partial\phi}
-(1+i\alpha_s)E_s
+i\frac{d_{2s}}{2}\frac{\partial^2 E_s}{\partial\phi^2}
+i\left(|E_s|^2+2\eta |E_p|^2+2\eta |E_i|^2\right)E_s
+i\gamma E_p^2E_i^* ,
$$

$$
\frac{\partial E_i}{\partial t}
=-\Delta_i\frac{\partial E_i}{\partial\phi}
-(1+i\alpha_i)E_i
+i\frac{d_{2i}}{2}\frac{\partial^2 E_i}{\partial\phi^2}
+i\left(|E_i|^2+2\eta |E_p|^2+2\eta |E_s|^2\right)E_i
+i\gamma E_p^2E_s^* .
$$

$\eta$ 是 XPM 相对强度， $\gamma$ 是复数 FWM 耦合系数， $\Delta_s$ 和 $\Delta_i$
描述 signal/idler 相对 primary 的 FSR mismatch；这些一阶导数项表示不同模式族
的群速度或 FSR 不完全匹配。默认参数来自 supplementary simulation parameters 的损耗归一化估计。

## 物理图像

Primary soliton 可以通过 Kerr 非线性为其他模式族提供相干增益。当 signal 和 idler
的色散、失谐和群速度条件合适时，primary 脉冲会通过 FWM 生成与其时域重合的
secondary color pulse。这样得到的是多个颜色共享同一个重复频率的 coupled soliton state。

四张图可以这样读：

- `Temporal field`：看 primary、signal、idler 脉冲是否在同一 $\phi$ 位置重合。
- `Comb spectrum`：比较三组谱的带宽、谱峰和相对强度。
- `Intracavity energy`：看三组模式族的归一化平均腔内功率是否先后建立并达到稳定。
- `Temporal evolution`：判断三场是否保持同步，或者发生漂移、断裂、失稳。

## Demo

1. 在 `MODEL` 中选择 `Multicolor soliton`。
2. 保持默认值：`grid = 1024`，其他参数使用 supplementary simulation
   parameters 的归一化默认值。
3. 点击 `Play`，先看 primary 是否形成局域脉冲。
4. 继续运行，观察 signal 和 idler 是否增长并与 primary 在时域重合。
5. 扫描 `alphaP`，寻找 primary-only、secondary-growth 和三色稳定区。
6. 扫描 `fsrMismatchI` 或 `fwmRe`，观察相位匹配对 multicolor pulse 的影响。

该模型是 reduced coupled-LLE demo，不包含真实器件的加热调谐、完整 mode-family
hybridization 或绝对单位功率标定。

## 参考文献

- Q.-X. Ji et al., "Multicolor interband solitons in microcombs," *Light: Science & Applications* **15**, 166 (2026). [https://doi.org/10.1038/s41377-026-02200-0](https://doi.org/10.1038/s41377-026-02200-0)
- Supplementary information for "Multicolor interband solitons in microcombs," especially Eqs. S1-S3 and the listed simulation parameters.
